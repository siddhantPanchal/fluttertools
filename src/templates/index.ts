import statefulPage from "./page/statefulPage";
import statelessHookPage from "./page/statelessHookPage";
import statelessPage from "./page/statelessPage";
import PageTemplate from "./pageTemplate";

export { PageTemplate };

export default function getAvailableTemplates() {
  return [statelessPage, statefulPage, statelessHookPage];
}
