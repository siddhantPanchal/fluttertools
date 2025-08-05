import statefulPage from "./page/statefulPage";
import statelessHookPage from "./page/statelessHookPage";
import statelessPage from "./page/statelessPage";
import PageTemplate from "./pageTemplate";
import { classTemplate } from "./class";
import { providerTemplate } from "./provider";
import { jsonSerializableTemplate } from "./jsonSerializable";
export const templates = {
    page: {
        stateful: statefulPage,
        stateless: statelessPage,
        statelessHook: statelessHookPage
    },
    class: classTemplate,
    provider: providerTemplate,
    jsonSerializable: jsonSerializableTemplate
};

export { PageTemplate };

export default function getAvailableTemplates() {
  return [statelessPage, statefulPage, statelessHookPage];
}
