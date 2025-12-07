import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  Calendar,
  Target,
  FileText,
  MessageSquare,
  BarChart3,
  Activity,
} from "lucide-react";

export default function InstructorDashboard() {
  const [timeRange, setTimeRange] = useState("week");

  // Simulated data - trong production sẽ fetch từ API
  const instructorData = {
    performance: {
      totalStudents: 234,
      activeClasses: 6,
      completionRate: 78.5,
      avgAttendance: 85.3,
      avgScore: 82.4,
      responseTime: 2.3, // hours
      studentSatisfaction: 4.6,
    },
    trends: {
      studentsChange: 12.5,
      classesChange: 2,
      completionChange: -3.2,
      attendanceChange: 5.8,
      scoreChange: 1.7,
      satisfactionChange: 0.3,
    },
    criticalMetrics: {
      pendingGrading: 47,
      upcomingDeadlines: 3,
      lowAttendanceClasses: 2,
      strugglingStudents: 8,
      certificatesToIssue: 5,
    },
    classPerformance: [
      {
        id: 1,
        name: "Advanced Web Development",
        students: 45,
        attendance: 92,
        avgScore: 87,
        completion: 78,
        atRisk: 3,
      },
      {
        id: 2,
        name: "Data Structures",
        students: 52,
        attendance: 88,
        avgScore: 84,
        completion: 82,
        atRisk: 5,
      },
      {
        id: 3,
        name: "Machine Learning Basics",
        students: 38,
        attendance: 76,
        avgScore: 79,
        completion: 71,
        atRisk: 7,
      },
      {
        id: 4,
        name: "Mobile Development",
        students: 41,
        attendance: 85,
        avgScore: 82,
        completion: 75,
        atRisk: 4,
      },
      {
        id: 5,
        name: "Cloud Architecture",
        students: 33,
        attendance: 89,
        avgScore: 86,
        completion: 80,
        atRisk: 2,
      },
      {
        id: 6,
        name: "UI/UX Design",
        students: 25,
        attendance: 94,
        avgScore: 88,
        completion: 85,
        atRisk: 1,
      },
    ],
    studentSegments: {
      highPerformers: 45, // score >= 90
      onTrack: 142, // score 70-89
      needsAttention: 35, // score 60-69
      atRisk: 12, // score < 60
    },
    timeAnalysis: {
      avgSessionDuration: 95, // minutes
      peakEngagementTime: "19:00-21:00",
      dropoffRate: 18, // % students dropping after week 3
      avgCompletionTime: 8.5, // weeks
    },
    contentEffectiveness: [
      {
        type: "Video Lectures",
        engagement: 87,
        completion: 92,
        satisfaction: 4.5,
      },
      {
        type: "Interactive Coding",
        engagement: 94,
        completion: 78,
        satisfaction: 4.8,
      },
      {
        type: "Reading Materials",
        engagement: 65,
        completion: 71,
        satisfaction: 3.9,
      },
      { type: "Quizzes", engagement: 82, completion: 88, satisfaction: 4.2 },
      { type: "Projects", engagement: 91, completion: 67, satisfaction: 4.7 },
    ],
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend,
    color,
    subtitle,
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== null && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend === "down" ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const ActionableInsight = ({ type, message, action, priority }) => {
    const priorityColors = {
      high: "border-l-4 border-red-500 bg-red-50",
      medium: "border-l-4 border-yellow-500 bg-yellow-50",
      low: "border-l-4 border-blue-500 bg-blue-50",
    };

    return (
      <div className={`p-4 rounded-lg ${priorityColors[priority]} mb-3`}>
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={`w-5 h-5 mt-0.5 ${
              priority === "high"
                ? "text-red-600"
                : priority === "medium"
                ? "text-yellow-600"
                : "text-blue-600"
            }`}
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm mb-1">{type}</p>
            <p className="text-sm text-gray-700 mb-2">{message}</p>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              {action} →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const insights = [
    {
      type: "Low Attendance Alert",
      message:
        "Machine Learning Basics has 76% attendance - 9% below your average. Students report scheduling conflicts.",
      action: "Review session times",
      priority: "high",
    },
    {
      type: "Content Effectiveness",
      message:
        "Reading materials show 65% engagement. Consider converting to video format or adding interactive elements.",
      action: "Optimize content",
      priority: "medium",
    },
    {
      type: "At-Risk Students",
      message:
        "8 students scored below 60% on recent assessments and need immediate intervention.",
      action: "Schedule 1-on-1s",
      priority: "high",
    },
    {
      type: "Engagement Drop",
      message:
        "18% of students drop off after week 3. This is above the 12% benchmark.",
      action: "Analyze week 3 content",
      priority: "medium",
    },
    {
      type: "High Performers",
      message:
        "45 students consistently score above 90%. Consider offering advanced challenges.",
      action: "Create bonus content",
      priority: "low",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teaching Performance Dashboard
          </h1>
          <p className="text-gray-600">
            Data-driven insights to improve your teaching effectiveness
          </p>

          {/* Time Range Selector */}
          <div className="flex gap-2 mt-4">
            {["week", "month", "quarter", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Students"
            value={instructorData.performance.totalStudents}
            change={instructorData.trends.studentsChange}
            trend="up"
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <MetricCard
            title="Avg Attendance Rate"
            value={`${instructorData.performance.avgAttendance}%`}
            change={instructorData.trends.attendanceChange}
            trend="up"
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-green-600"
            subtitle="Industry avg: 80%"
          />
          <MetricCard
            title="Avg Student Score"
            value={`${instructorData.performance.avgScore}%`}
            change={instructorData.trends.scoreChange}
            trend="up"
            icon={Award}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtitle="Target: 85%"
          />
          <MetricCard
            title="Completion Rate"
            value={`${instructorData.performance.completionRate}%`}
            change={instructorData.trends.completionChange}
            trend="down"
            icon={Target}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            subtitle="Down from last period"
          />
        </div>

        {/* Critical Actions Needed */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Critical Actions Needed
            </h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {instructorData.criticalMetrics.pendingGrading}
              </div>
              <div className="text-sm text-gray-700 font-medium">
                Pending Grading
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Avg: 2.3 days wait
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {instructorData.criticalMetrics.upcomingDeadlines}
              </div>
              <div className="text-sm text-gray-700 font-medium">
                Upcoming Deadlines
              </div>
              <div className="text-xs text-gray-500 mt-1">Next 3 days</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {instructorData.criticalMetrics.lowAttendanceClasses}
              </div>
              <div className="text-sm text-gray-700 font-medium">
                Low Attendance
              </div>
              <div className="text-xs text-gray-500 mt-1">Below 80%</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {instructorData.criticalMetrics.strugglingStudents}
              </div>
              <div className="text-sm text-gray-700 font-medium">
                At-Risk Students
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Need intervention
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {instructorData.criticalMetrics.certificatesToIssue}
              </div>
              <div className="text-sm text-gray-700 font-medium">
                Certificates Pending
              </div>
              <div className="text-xs text-gray-500 mt-1">Ready to issue</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Class Performance Analysis */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Class Performance Deep Dive
            </h2>
            <div className="space-y-3">
              {instructorData.classPerformance.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {cls.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {cls.students} students
                      </p>
                    </div>
                    {cls.atRisk > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        {cls.atRisk} at risk
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {cls.attendance}%
                      </div>
                      <div className="text-xs text-gray-600">Attendance</div>
                      <div
                        className={`text-xs mt-1 ${
                          cls.attendance >= 85
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {cls.attendance >= 85 ? "✓ Good" : "⚠ Low"}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {cls.avgScore}%
                      </div>
                      <div className="text-xs text-gray-600">Avg Score</div>
                      <div
                        className={`text-xs mt-1 ${
                          cls.avgScore >= 85
                            ? "text-green-600"
                            : cls.avgScore >= 75
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {cls.avgScore >= 85
                          ? "✓ Excellent"
                          : cls.avgScore >= 75
                          ? "~ Fair"
                          : "⚠ Needs work"}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {cls.completion}%
                      </div>
                      <div className="text-xs text-gray-600">Completion</div>
                      <div
                        className={`text-xs mt-1 ${
                          cls.completion >= 80
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {cls.completion >= 80 ? "✓ On track" : "~ Monitor"}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {cls.students - cls.atRisk}
                      </div>
                      <div className="text-xs text-gray-600">Healthy</div>
                      <div className="text-xs text-green-600 mt-1">
                        {Math.round(
                          ((cls.students - cls.atRisk) / cls.students) * 100
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Segmentation */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Student Segmentation
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    High Performers
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {instructorData.studentSegments.highPerformers}
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (instructorData.studentSegments.highPerformers /
                          instructorData.performance.totalStudents) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Score ≥90% • Ready for advanced content
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    On Track
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {instructorData.studentSegments.onTrack}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (instructorData.studentSegments.onTrack /
                          instructorData.performance.totalStudents) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Score 70-89% • Progressing well
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Needs Attention
                  </span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {instructorData.studentSegments.needsAttention}
                  </span>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (instructorData.studentSegments.needsAttention /
                          instructorData.performance.totalStudents) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Score 60-69% • Consider extra support
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    At Risk
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {instructorData.studentSegments.atRisk}
                  </span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (instructorData.studentSegments.atRisk /
                          instructorData.performance.totalStudents) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Score &lt;60% • Urgent intervention needed
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Recommendation:</strong> Schedule 1-on-1 sessions with
                at-risk students this week.
              </p>
              <button className="w-full text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Create Intervention Plan
              </button>
            </div>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              AI-Powered Insights
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Based on your teaching patterns and student performance data
            </p>
            {insights.map((insight, idx) => (
              <ActionableInsight key={idx} {...insight} />
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Content Effectiveness
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Which content types work best for your students
            </p>
            <div className="space-y-4">
              {instructorData.contentEffectiveness.map((content, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">
                      {content.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">★</span>
                      <span className="font-bold text-gray-900">
                        {content.satisfaction}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Engagement</span>
                        <span>{content.engagement}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            content.engagement >= 85
                              ? "bg-green-500"
                              : content.engagement >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${content.engagement}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Completion</span>
                        <span>{content.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            content.completion >= 85
                              ? "bg-green-500"
                              : content.completion >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${content.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {content.engagement < 70 && (
                    <div className="mt-2 text-xs text-orange-600 font-medium">
                      💡 Consider improving or replacing this content type
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time & Engagement Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Time & Engagement Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {instructorData.timeAnalysis.avgSessionDuration} min
              </div>
              <div className="text-sm text-gray-600">Avg Session Duration</div>
              <div className="text-xs text-gray-500 mt-1">Target: 90 min</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {instructorData.timeAnalysis.peakEngagementTime}
              </div>
              <div className="text-sm text-gray-600">Peak Engagement</div>
              <div className="text-xs text-gray-500 mt-1">
                Schedule key content here
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingDown className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {instructorData.timeAnalysis.dropoffRate}%
              </div>
              <div className="text-sm text-gray-600">Dropoff Rate</div>
              <div className="text-xs text-gray-500 mt-1">After week 3</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {instructorData.timeAnalysis.avgCompletionTime} wks
              </div>
              <div className="text-sm text-gray-600">Avg Completion Time</div>
              <div className="text-xs text-gray-500 mt-1">Expected: 10 wks</div>
            </div>
          </div>
        </div>

        {/* Quick Benchmarks */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">
            Your Performance vs. Platform Average
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm opacity-90 mb-1">Attendance Rate</div>
              <div className="text-2xl font-bold">85.3%</div>
              <div className="text-xs opacity-75 mt-1">
                Platform avg: 80.1% (+5.2%)
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm opacity-90 mb-1">
                Student Satisfaction
              </div>
              <div className="text-2xl font-bold">4.6/5.0</div>
              <div className="text-xs opacity-75 mt-1">
                Platform avg: 4.2/5.0 (+0.4)
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm opacity-90 mb-1">Response Time</div>
              <div className="text-2xl font-bold">2.3h</div>
              <div className="text-xs opacity-75 mt-1">
                Platform avg: 6.5h (64% faster)
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm opacity-90 mb-1">Completion Rate</div>
              <div className="text-2xl font-bold">78.5%</div>
              <div className="text-xs opacity-75 mt-1">
                Platform avg: 75.2% (+3.3%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
