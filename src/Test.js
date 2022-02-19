import { useState } from "react";
import DataGrid, { SelectColumn, TextEditor } from "react-data-grid";
const highlightClassname = css`
  .rdg-cell {
    background-color: #9370db;
    color: white;
  }

  &:hover .rdg-cell {
    background-color: #800080;
  }
`;

function rowKeyGetter(row) {
  return row.id;
}

faker.locale = "en_GB";

const columns = [
  SelectColumn,
  {
    key: "id",
    name: "ID",
    width: 80,
    resizable: true,
    frozen: true,
  },
  {
    key: "avatar",
    name: "Avatar",
    width: 40,
    resizable: true,
    headerRenderer: () => <ImageFormatter value={faker.image.cats()} />,
    formatter: ({ row }) => <ImageFormatter value={row.avatar} />,
  },
  {
    key: "title",
    name: "Title",
    width: 200,
    resizable: true,
    formatter(props) {
      return <>{props.row.title}</>;
    },
    editor: DropDownEditor,
    editorOptions: {
      editOnClick: true,
    },
  },
  {
    key: "firstName",
    name: "First Name",
    width: 200,
    resizable: true,
    frozen: true,
    editor: TextEditor,
  },
  {
    key: "lastName",
    name: "Last Name",
    width: 200,
    resizable: true,
    frozen: true,
    editor: TextEditor,
  },
  {
    key: "email",
    name: "Email",
    width: 200,
    resizable: true,
    editor: TextEditor,
  },
  {
    key: "street",
    name: "Street",
    width: 200,
    resizable: true,
    editor: TextEditor,
  },
  {
    key: "zipCode",
    name: "ZipCode",
    width: 200,
    resizable: true,
    editor: TextEditor,
  },
  {
    key: "date",
    name: "Date",
    width: 200,
    resizable: true,
    editor: TextEditor,
  },
  {
    key: "bs",
    name: "bs",
    width: 200,
    resizable: true,
    editor: TextEditor,
  },
  {
    key: "catchPhrase",
    name: "Catch Phrase",
    width: 200,
    resizable: true,
    editor: TextEditor,
  },
  {
    key: "companyName",
    name: "Company Name",
    width: 200,
    resizable: true,
    editor: TextEditor,
  },
  {
    key: "sentence",
    name: "Sentence",
    width: 200,
    resizable: true,
    editor: TextEditor,
  },
];

function createRows() {
  const rows = [];

  for (let i = 0; i < 2000; i++) {
    rows.push({
      id: `id_${i}`,
      avatar: faker.image.avatar(),
      email: faker.internet.email(),
      title: faker.name.prefix(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      street: faker.address.streetName(),
      zipCode: faker.address.zipCode(),
      date: faker.date.past().toLocaleDateString(),
      bs: faker.company.bs(),
      catchPhrase: faker.company.catchPhrase(),
      companyName: faker.company.companyName(),
      words: faker.lorem.words(),
      sentence: faker.lorem.sentence(),
    });
  }

  return rows;
}
export default function AllFeatures() {
  const [rows, setRows] = useState(createRows);
  const [selectedRows, setSelectedRows] = useState(() => new Set());

  function handleFill({ columnKey, sourceRow, targetRow }) {
    return { ...targetRow, [columnKey]: sourceRow[columnKey] };
  }

  function handlePaste({
    sourceColumnKey,
    sourceRow,
    targetColumnKey,
    targetRow,
  }) {
    const incompatibleColumns = ["email", "zipCode", "date"];
    if (
      sourceColumnKey === "avatar" ||
      ["id", "avatar"].includes(targetColumnKey) ||
      ((incompatibleColumns.includes(targetColumnKey) ||
        incompatibleColumns.includes(sourceColumnKey)) &&
        sourceColumnKey !== targetColumnKey)
    ) {
      return targetRow;
    }

    return { ...targetRow, [targetColumnKey]: sourceRow[sourceColumnKey] };
  }

  return (
    <>
      <DataGrid
        columns={columns}
        rows={rows}
        rowKeyGetter={rowKeyGetter}
        onRowsChange={setRows}
        onFill={handleFill}
        onPaste={handlePaste}
        rowHeight={30}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        className="fill-grid"
        rowClass={(row) =>
          row.id.includes("7") ? highlightClassname : undefined
        }
      />
    </>
  );
}
