import { NextResponse } from 'next/server';
import { verifyToken } from '../../../actions/verifySession';
import { cookies } from 'next/headers';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { authorization } = req.headers;
    
    if (!authorization?.startsWith('Bearer ')) {
      
      return res.status(401).json(
        { 
          isAuthenticated: false,
          message: 'Invalid authorization header format'
        }
      );
    }

    const token = authorization.split('Bearer ')[1];
    
    if (!token) {
      res.setHeader('Set-Cookie', 'AccessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
      
      return res.status(401).json(
        { 
          isAuthenticated: false,
          message: 'No token provided'
        }
      );
    }

    const decodedToken = await verifyToken(token);

    console.log(decodedToken);

    if (!decodedToken) {     
      return res.status(401).json(
        { 
          isAuthenticated: false,
          message: 'Invalid token'
        }
      );
    }

    return res.status(200).json({
      isAuthenticated: true,
      user: decodedToken
    });

  } catch (error) {
    console.error('Token verification error:', error);

    return res.status(501).json(
      { 
        isAuthenticated: false,
        message: 'Authentication error occurred',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    );
  }
}