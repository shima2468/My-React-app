import Header from "@/assets/Components/Header/Header.jsx";
import StatsRow from "@/assets/Components/OverviewComponents/StatsRow/StatsRow";
import StudyMaterialsUploader from "@/assets/Components/StudyMaterialsUploader/StudyMaterialsUploader";
import RecentActivity from "@/assets/Components/OverviewComponents/RecentActivity/RecentActivity";
import StudyGoals from "@/assets/Components/OverviewComponents/StudyGoals/StudyGoals";
import AIStudyTools from "@/assets/Components/AIStudyTools/AIStudyTools";

export default function Overview() {
  return (
    <div className="space-y-8">
      <Header
        title="Welcome back, Student!"
        subtitle="Ready to supercharge your studying with AI-powered tools?"
      />
      <StatsRow />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StudyMaterialsUploader />
          <AIStudyTools title="AI Study Tools" />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <RecentActivity />
          <StudyGoals />
        </div>
      </div>
    </div>
  );
}
