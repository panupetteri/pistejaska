import { ReactNode } from "react";

const ListItemText: React.FC<{
  title: ReactNode;
  description?: ReactNode;
}> = ({ title, description }) => (
  <div className="flex-1 pl-1 mr-8">
    <div className="font-medium">{title}</div>
    <div className="text-slate-600 text-sm break-word">{description}</div>
  </div>
);

export default ListItemText;
