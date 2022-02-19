import range from "lodash/range";
import React from "react";
import ReactDataGrid, { Row } from "react-data-grid";
// import "react-data-grid/dist/react-data-grid.css";
import ReactDOM from "react-dom";
import "./styles.css";

const titles = ["Dr.", "Mr.", "Mrs.", "Miss", "Ms."];

function DropDownEditor({ row, onRowChange }) {
  console.log(row, onRowChange);
  return (
    <select
      // className={textEditorClassname}
      value={row?.title}
      onChange={(event) =>
        onRowChange({ ...row, title: event.target.value }, true)
      }
      autoFocus
    >
      {titles.map((title) => (
        <option key={title} value={title}>
          {title}
        </option>
      ))}
    </select>
  );
}
class DropdownCustomEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: "",
    };
    this.options = [
      { id: "blocked", value: "BLOCKED" },
      { id: "pass", value: "PASS" },
      { id: "issue", value: "ISSUE" },
      { id: "notStarted", value: "NOT STARTED" },
    ];
  }
  componentDidMount() {
    if (this.props.row && this.props.row.status)
      this.setState({ selected: this.props.row.status });
  }
  getValue = function () {
    return { title: this.state.selected };
  };
  getInputNode() {
    return ReactDOM.findDOMNode(this).getElementsByTagName("select")[0];
  }
  // update(e) {
  //   this.setState({ selected: e.target.value });
  //   this.props.onRowChange({ ...this.props.row, status: e.target.value }, true);
  // }
  update(e) {
    this.setState({ selected: e.target.value });
    // this.props.onRowChange({ ...this.props.row, status: e.target.value });
  }
  render() {
    return (
      <select
        className="rdg-select-editor"
        onChange={(e) => this.update(e)}
        autoFocus
        value={this.state.selected}
      >
        {this.options.map((elem) => {
          return (
            <option key={elem.id} value={elem.value}>
              {elem.value}
            </option>
          );
        })}
      </select>
    );
  }
}

/*
  Validator is a state passed from the parent page that indicates whether page is on validation or not, in case
  if dev want the table to validate when a trigger hits the page (like submit button?)
*/

const CustomRow = (props) => {
  // console.log(props)

  return (
    <Row
      {...props}
      cellRenderer={(cellProps) => {
        // console.log(cellProps);
        return <CustomCell {...cellProps} />;
      }}
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

  if (validator) {
    valueValidation = validator(value);
    // console.log(valueValidation, rowIdx, idx);
    /* Insert custom validation in here */
    return (
      <span
        style={{ fontWeight: "bold", border: "4px solid blue", color: "gray" }}
      >
        <ReactDataGrid.Cell
          {...props}
          tooltip={valueValidation ? valueValidation : ""}
          style={{ border: "2px solid red" }}
          cellControl={{ style: { border: "1px solid red" } }}
          className={valueValidation ? "error" : ""}
        />
      </span>
    );
  }

  /* If not in validation mode, display normal rows */
  if (!validator) {
    return <ReactDataGrid.Cell {...props} />;
  }
};

const columns = [
  {
    key: "id",
    name: "ID",
    editable: true,
    validator: (value) => {
      return typeof value !== "number" && "value must be number";
    },
  },
  // { key: "title", name: "Title", editable: true },
  {
    key: "complete",
    name: "Complete",
    editable: true,
    formatter(props) {
      return <>${props.row.complete}</>;
    },
  },
  {
    key: "title",
    name: "Title",
    width: 200,
    resizable: true,
    formatter(props) {
      return <>{props.row.title}</>;
    },
    editor: DropdownCustomEditor,
    editorOptions: {
      editOnClick: true,
    },
  },
];

const rows = [
  { id: 0, title: "Dr.", complete: 20 },
  { id: 1, title: "Task 2", complete: 40 },
  { id: "parag", title: "Task 3", complete: 60 },
  { id: "parag", title: "Task 3", complete: 60 },
];
const defaultParsePaste = (str) => {
  // console.log(str);
  return str.split(/\r\n|\n|\r/).map((row) => row.split("\t"));
};

const changedValues = {};
class Example extends React.Component {
  constructor(props) {
    super(props);
    const defaultColumnProperties = {
      resizable: true,
      // filterable: true,
      // filterRenderer: AutoCompleteFilter,
      editable: true,
      // sortable: true
    };
    this.state = {
      rows,
      topLeft: {},
      botmRight: {},
      filters: "",
    };

    // Copy paste event handler
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("paste", this.handlePaste);
    // document.addEventListener('keydown', this.handleEnter);
  }

  componentWillUnmount() {
    this.removeAllListeners();
  }

  removeAllListeners = () => {
    document.removeEventListener("copy", this.handleCopy);
    document.removeEventListener("paste", this.handlePaste);
    // document.removeEventListener('keydown', this.handleEnter);
  };

  rowGetter = (i) => {
    const { rows } = this.state;
    return rows[i];
  };

  updateRows = (startIdx, newRows) => {
    this.setState((state) => {
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

  handleCopy = (e) => {
    // console.log(e);
    e.preventDefault();
    const { topLeft, botmRight } = this.state;
    // Loop through each row
    const text = range(topLeft.rowIdx, botmRight.rowIdx + 1)
      .map(
        // Loop through each column
        (rowIdx) =>
          columns
            .slice(topLeft.colIdx, botmRight.colIdx + 1)
            .map(
              // Grab the row values and make a text string
              (col) => this.rowGetter(rowIdx)[col.key]
            )
            .join("\t")
      )
      .join("\n");
    // console.log(text)
    e.clipboardData.setData("text/plain", text);
  };

  handlePaste = (e) => {
    e.preventDefault();
    const { topLeft } = this.state;

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

    this.updateRows(topLeft.rowIdx, newRows);
  };
  setSelection = (args) => {
    // console.log(args)
    this.setState({
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
  onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    this.setState((state) => {
      const rows = state.rows.slice();
      for (let i = fromRow; i <= toRow; i++) {
        rows[i] = { ...rows[i], ...updated };
      }
      return { rows };
    });
  };
  // onGridRowsUpdated = (rows) => {
  //   this.setState({ rows });
  // };
  render() {
    return (
      <ReactDataGrid
        rowHeight={30}
        className="fill-grid"
        columns={columns}
        rowGetter={(i) => this.state.rows[i]}
        rowsCount={3}
        onGridRowsUpdated={this.onGridRowsUpdated}
        enableCellSelect={true}
        cellRangeSelection={{
          onComplete: this.setSelection,
        }}
        rowRenderer={CustomRow}
        // onRowsChange={(rows) => {
        //   console.log(rows); //not working
        // }}
        onRowsChange={(rows) => this.onGridRowsUpdated(rows)}
        onCellSelected={({ rowIdx, idx }) => {
          console.log("selected cell (" + rowIdx + "," + idx + ") ");
        }}
        onCellDeSelected={({ rowIdx, idx }) => {
          console.log("deselected cell (" + rowIdx + "," + idx + ") ");
        }}
      />
    );
  }
}

export default Example;
