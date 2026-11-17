import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import PomodoroView from "@/components/pomodoro/pomodoro_view";

const PATH = "/pomodoro";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Pomodoro Timer</h1>
      <PomodoroView />
      <ToolSeo path={PATH} />
    </>
  );
}
