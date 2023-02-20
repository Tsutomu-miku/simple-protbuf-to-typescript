import "./styles.css";
import React, { useState, useEffect } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-protobuf";
import "ace-builds/src-noconflict/theme-monokai";

const defaultProtobuf = `
message web_api_v2_creator_income_optional_category_response {
  required int32 status_code = 1; // 状态码
  required string status_msg = 2; // 状态信息
  repeated OptionalIncomeCategory optional_category_list = 3; // 待开通授权类目列表
  repeated CardIncomeCategory card_category_list = 4; // 推荐开通卡片列表
  repeated AuthorizedIncomeCategory authorized_category_list = 5; // 已开通授权类目列表
  repeated FailReason fail_reason = 7; 
}
`;

function useDebounce<T>(value: T, delay?: number, callback?: (v: T) => T): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedValue(callback ? callback(value) : value),
      delay || 500
    );

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function transProtobufToTs(protobuf: string) {
  return protobuf.replace(
    /message\s+(\w+)\s+\{([\s\S]+?)\}/g,
    (_, typeName, body) => {
      const camelTypeName = typeName.replace(/_(\w)/g, (_, letter: string) =>
        letter.toUpperCase()
      );
      let fields = "";
      body.replace(
        /(required|repeated)\s+(\w+)\s+(\w+)\s*=\s*(\d+)\s*;(\s*\/\/\s*(.*))?/g,
        (_, mode, typeName, fieldName, fieldNumber, comment) => {
          let tsType = typeName;
          if (typeName === "string") {
            tsType = "string";
          }
          if (typeName === "int32") {
            tsType = "number";
          }
          if (mode === "repeated") {
            tsType += "[]";
          }
          if (comment) {
            fields += `    /**
       * ${comment?.slice(3) || ""}
       */`;
          }
          fields += `
      ${fieldName}: ${tsType};
  `;
        }
      );
      return `interface ${camelTypeName} {\n${fields}}`;
    }
  );
}

function App() {
  const [protobuf, setProtobuf] = useState(defaultProtobuf);
  const typescript = useDebounce(protobuf, 300, transProtobufToTs);

  return (
    <div className="App">
      <AceEditor
        mode="protobuf"
        theme="monokai"
        value={protobuf}
        onChange={setProtobuf}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        className="editor"
        width="50%"
        height="100vh"
      />
      <AceEditor
        className="editor"
        width="50%"
        height="100vh"
        mode="typescript"
        theme="monokai"
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        fontSize={14}
        value={typescript}
      />
    </div>
  );
}

export default App;
