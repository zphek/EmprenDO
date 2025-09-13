import { imProjectOwner } from "../../../../../../actions/projectActions";
import { ProjectNormal } from "./ProjectNormal";
import ProjectOwnerDashboard from "./ProjectOwnerDashboard";


export default async function ProjectPage({ params }: { params: { id: string } }) {
  const isOwner = await imProjectOwner(params.id);
  return isOwner ? <ProjectOwnerDashboard projectId={params.id}/> : <ProjectNormal params={params} />;
}