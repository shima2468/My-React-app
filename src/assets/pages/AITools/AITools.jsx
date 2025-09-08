import Header from "@/assets/Components/Header/Header";
import AIStudyTools from "@/assets/Components/AIStudyTools/AIStudyTools";

export default function AITools() {
  return (
    <div className="space-y-6">
      <Header
        title="AI-Powered Study Tools"
        subtitle="Transform your materials with intelligent study aids"
      />

      <AIStudyTools mt={0} cardPadding="p-12" />
    </div>
  );
}
