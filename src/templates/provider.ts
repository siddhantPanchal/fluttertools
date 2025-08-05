
import { pascalToCamelCase, pascalToSnakeCase } from "../utils/utils";

export function providerTemplate(providerName: string, providerType: string): string {
    const fileName = pascalToSnakeCase(providerName);
    const functionName = pascalToCamelCase(providerName);

    switch (providerType) {
        case 'Provider (function)':
            return `
import 'package:riverpod_annotation/riverpod_annotation.dart';

part '${fileName}.g.dart';

@riverpod
// TODO: specify the provider return type
Future<void> ${functionName}(Ref ref) async {
  // TODO: implement provider
}
`;
        case 'Provider (class)':
            return `
import 'package:riverpod_annotation/riverpod_annotation.dart';

part '${fileName}.g.dart';

@riverpod
class ${providerName} extends _${providerName} {
  @override
  // TODO: specify the provider return type
  Future<void> build() async {
    // TODO: implement build
  }
}
`;
        default:
            return ``;
    }
}

