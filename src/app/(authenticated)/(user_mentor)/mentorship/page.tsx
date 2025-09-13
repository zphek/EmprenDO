import getSession from "../../../../../actions/verifySession";
import MentorDashboard from "./MentorDashboard";

// ID fijo del mentor para pruebas
const MENTOR_ID = "Phg9MrejEtrI4YgBdC2n";

export default async function MentorshipPage(){
  const session = (await getSession());

  return <MentorDashboard MENTOR_ID={session.user?.uid}/>
}