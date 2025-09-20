import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleSuccessfulPayment(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const { projectId } = paymentIntent.metadata;
  const amount = paymentIntent.amount / 100; // Convert from cents

  if (!projectId) {
    console.error('No projectId found in payment metadata');
    return;
  }

  try {
    // Add investment record
    await addDoc(collection(db, 'investments'), {
      projectId,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'completed',
      createdAt: serverTimestamp(),
    });

    // Update project's moneyReached
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      const currentMoneyReached = projectSnap.data().moneyReached || 0;
      await updateDoc(projectRef, {
        moneyReached: currentMoneyReached + amount
      });
    }

    console.log(`Successfully processed payment for project ${projectId}: $${amount}`);
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}