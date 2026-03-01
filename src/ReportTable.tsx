import { Tooltip } from "react-tooltip";
import { Link } from "react-router-dom";
import Table from "./common/components/tables/Table";
import TableHead from "./common/components/tables/TableHead";
import TableRow from "./common/components/tables/TableRow";
import TableHeadCell from "./common/components/tables/TableHeadCell";
import TableBody from "./common/components/tables/TableBody";
import TableCell from "./common/components/tables/TableCell";

type ReportTableProps = {
  rows: ReportTableRow[][];
  columns: { name: string; tooltip?: string }[];
};
type ReportTableRow = {
  value: string;
  link?: string;
};
const ReportTable = ({ rows, columns }: ReportTableProps) => {
  if (rows.length === 0) {
    return <>No plays</>;
  }

  return (
    <div className="w-full">
      <Tooltip />
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableHeadCell key={c.name}>
                {c.name}
                {c.tooltip ? (
                  <span
                    style={{
                      borderRadius: "10px",
                      padding: "0 5px",
                      backgroundColor: "#ccc",
                      color: "#fff",
                      marginLeft: "5px",
                    }}
                    data-tooltip-content={c.tooltip}
                  >
                    ?
                  </span>
                ) : (
                  <></>
                )}
              </TableHeadCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row[0].value}>
              {columns.map((column, columnIdx) => {
                const link = row[columnIdx]?.link;
                return (
                  <TableCell scope="row" key={`${row[0].value}:${column.name}`}>
                    {link != null ? (
                      <Link
                        className="cursor-pointer hover:text-black"
                        to={link}
                      >
                        {row[columnIdx]?.value}
                      </Link>
                    ) : (
                      row[columnIdx]?.value
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReportTable;
