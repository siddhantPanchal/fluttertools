
import { pascalToSnakeCase } from "../utils/utils";

export function jsonSerializableTemplate(className: string): string {
    const fileName = pascalToSnakeCase(className);

    return `
import 'package:json_annotation/json_annotation.dart';

part '${fileName}.g.dart';

@JsonSerializable()
class ${className} {
  ${className}();

  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);

  Map<String, dynamic> toJson() => _$${className}ToJson(this);
}
`;
}
