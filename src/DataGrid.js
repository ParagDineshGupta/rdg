import { range } from "lodash";
import { useEffect, useState } from "react";
import DataGrid, { Row, SelectColumn, TextEditor } from "react-data-grid";
import "./styles.css";
const defaultParsePaste = (str) => {
  // console.log(str);
  return str.split(/\r\n|\n|\r/).map((row) => row.split("\t"));
};
const CustomRow = (props) => {
  return (
    <Row
      {...props}
      // selectedCellEditor={(cellProps) => {
      //   debugger;
      //   return <CustomCell {...cellProps} />;
      // }}
    />
  );
};
const CustomCell = (props) => {
  let valueValidation = false;
  const {
    column: { validator },
    value,
    rowIdx,
    idx,
  } = props;
  debugger;

  if (validator) {
    debugger;
    valueValidation = validator(value);
    // console.log(valueValidation, rowIdx, idx);
    /* Insert custom validation in here */
    return (
      <span
        style={{ fontWeight: "bold", border: "4px solid blue", color: "gray" }}
      >
        <SelectColumn
          {...props}
          tooltip={valueValidation ? valueValidation : ""}
          //   style={{ border: "2px solid red" }}
          //   cellControl={{ style: { border: "1px solid red" } }}
          className={valueValidation ? "error" : ""}
        />
      </span>
    );
  }

  /* If not in validation mode, display normal rows */
  if (!validator) {
    return <SelectColumn {...props} />;
  }
};
const initialRows = [
  {
    id: 0,
    title: "Example",
  },
  { id: 1, title: "Demo" },
];
const ReactDataGrid = (props) => {
  // const [rows, setRows] = useState(initialRows);
  const [state, setState] = useState({
    rows: initialRows,
    topLeft: {},
    botmRight: {},
    filters: "",
  });
  const changedValues = {};

  useEffect(() => {
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);
  const rowGetter = (i) => {
    const { rows } = state;
    return rows[i];
  };
  const updateRows = (startIdx, newRows) => {
    debugger;
    setState((state) => {
      const rows = state.rows.slice();
      for (let i = 0; i < newRows.length; i++) {
        if (startIdx + i < rows.length) {
          changedValues[startIdx + i] = {
            ...changedValues[startIdx + i],
            ...newRows[i],
          };
          rows[startIdx + i] = { ...rows[startIdx + i], ...newRows[i] };
        }
      }
      return { rows };
    });
  };
  const handleCopy = (e) => {
    // console.log(e);
    e.preventDefault();
    const { topLeft, botmRight } = state;
    debugger;
    // Loop through each row
    const text = range(topLeft.rowIdx, botmRight.rowIdx + 1)
      .map(
        // Loop through each column
        (rowIdx) =>
          columns
            .slice(topLeft.colIdx, botmRight.colIdx + 1)
            .map(
              // Grab the row values and make a text string
              (col) => rowGetter(rowIdx)[col.key]
            )
            .join("\t")
      )
      .join("\n");
    // console.log(text)
    e.clipboardData.setData("text/plain", text);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const { topLeft } = state;

    const newRows = [];
    const pasteData = defaultParsePaste(e.clipboardData.getData("text/plain"));

    pasteData.forEach((row) => {
      const rowData = {};
      // Merge the values from pasting and the keys from the columns
      columns
        .slice(topLeft.colIdx, topLeft.colIdx + row.length)
        .forEach((col, j) => {
          // Create the key-value pair for the row
          rowData[col.key] = row[j];
        });
      // Push the new row to the changes
      newRows.push(rowData);
    });

    updateRows(topLeft.rowIdx, newRows);
  };
  const setSelection = (args) => {
    console.log(args);
    setState({
      topLeft: {
        rowIdx: args.topLeft.rowIdx,
        colIdx: args.topLeft.idx,
      },
      botmRight: {
        rowIdx: args.bottomRight.rowIdx,
        colIdx: args.bottomRight.idx,
      },
    });
  };
  const addRows = (e) => {
    // setRows([...rows, { id: rows.length, title: "parag" }]);
    // const newData = new Array(1).fill({ id: "", title: "", complete: "" });
    //   setState(prevState => ({rows: [...prevState.rows, ...newData]}), ()=>{console.log("updated",state.rows)});
  };
  const onGridRowsUpdated = (rows) => {
    debugger;
    const { fromRow, toRow, updated } = rows;
    setState((state) => {
      const rows = state.rows.slice();
      for (let i = fromRow; i <= toRow; i++) {
        rows[i] = { ...rows[i], ...updated };
      }
      return { rows };
    });
  };
  return (
    <>
      <DataGrid
        rowHeight={20}
        headerRowHeight={20}
        columns={columns}
        rows={state.rows}
        rowKeyGetter={rowKeyGetter}
        rowGetter={(i) => state.rows[i]}
        enableCellSelect={true}
        onGridRowsUpdated={onGridRowsUpdated} //nw
        // onRowsChange={setRows}
        onRowsChange={(rows) => setState({ rows })}
        rowRenderer={CustomRow}
        cellRangeSelection={{
          //nw
          onStart: () => {
            debugger;
          },
          onComplete: setSelection,
        }}
      />
      <button onClick={addRows}>Add Rows</button>
    </>
  );
};

function rowKeyGetter(row) {
  return row.id;
}
const currencyFormatter = ({ column, isCellSelected, onRowChange, row }) => {
  return <>$ {row[column.key]}</>;
};
const columns = [
  {
    key: "id",
    name: "ID",
    editable: true,
    editorOptions: {
      editOnClick: true,
    },
    editor: TextEditor,
    formatter: currencyFormatter,
    validator: (value) => {
      return typeof value !== "number" && "value must be number";
    },
    // cellClass: "error",
  },
  {
    cellClass: "px-0",
    key: "title",
    name: "Title",
    editable: true,
    editorOptions: {
      editOnClick: true,
    },
    editor: TextEditor,
    formatter: ({ column, isCellSelected, onRowChange, row }) => {
      console.log({ column });

      return (
        <div className="px-1" style={{ background: "#f2f9de" }}>
          {row[column.key]}
        </div>
      );
    },
  },
];

export default ReactDataGrid;
