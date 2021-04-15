export enum QuerySyntaxEnum {
  COMMAND = "COMMAND",
  SHELL = "SHELL",
}

type ConversionProps = {
  [key in QuerySyntaxEnum]?: (syntax: string) => string;
};

export interface QuerySyntaxOptionProps {
  value: QuerySyntaxEnum;
  glyph: string;
  description: string;
  language: string;
  template: string;
  conversions: ConversionProps;
}

export const QUERY_SYNTAX_OPTIONS: QuerySyntaxOptionProps[] = [
  {
    description: "Follow command syntax",
    glyph: "CurlyBraces",
    value: QuerySyntaxEnum.COMMAND,
    language: "json",
    template: JSON.stringify(
      {
        collection: "foo",
        query: {
          pipeline: [
            { $lookup: { from: "bar", as: "bar", pipeline: [] } },
            { $addFields: { c: "abc" } },
          ],
        },
      },
      null,
      2
    ),
    conversions: {
      [QuerySyntaxEnum.COMMAND]: (mql: string) => {
        return mql;
      },
      [QuerySyntaxEnum.SHELL]: (mql: string) => {
        const { collection, query } = JSON.parse(mql);
        const command =
          Object.keys(query)[0] === "pipeline" ? "aggregate" : "find";
        const predicate = JSON.stringify(query[Object.keys(query)[0]], null, 2);
        return `db.${collection}.${command}(${predicate})`;
      },
    },
  },
  {
    description: "Follow shell syntax",
    glyph: "Laptop",
    value: QuerySyntaxEnum.SHELL,
    language: "javascript",
    template: `db.foo.aggregate(\n[\n{\n"$lookup": { \n"from": "bar", "as": "bar", "pipeline": [] } },\n{\n"$addFields": { \n"c": "abc" } }\n]\n)`,
    conversions: {
      [QuerySyntaxEnum.COMMAND]: (mql: string) => {
        const strippedMql = mql.replace(/\s/g, "");
        const regex = /db.(?<collection>\w+).(?<command>\w+)\((?<predicate>.*)\)/.exec(
          strippedMql
        );
        const groups = regex!.groups;
        return JSON.stringify(
          {
            collection: groups!.collection,
            query: {
              [groups!.command === "aggregate"
                ? "pipeline"
                : "filter"]: JSON.parse(groups!.predicate),
            },
          },
          null,
          2
        );
      },
      [QuerySyntaxEnum.SHELL]: (mql: string) => {
        return mql;
      },
    },
  },
];
