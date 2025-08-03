import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import QuestionModel from "@/models/Question"

// GET /api/stats - 통계 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.email

    // 전체 문제 수
    const totalQuestions = await QuestionModel.countDocuments({ userId })

    // 최근 7일간 생성된 문제 수
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentQuestions = await QuestionModel.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    })

    // 태그별 분포
    const tagDistribution = await QuestionModel.aggregate([
      { $match: { userId } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, tag: "$_id", count: 1 } },
    ])

    // 난이도별 분포
    const difficultyDistribution = await QuestionModel.aggregate([
      { $match: { userId } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $project: { _id: 0, difficulty: "$_id", count: 1 } },
    ])

    // 주간 생성 추이 (최근 4주)
    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
    const weeklyTrend = await QuestionModel.aggregate([
      { 
        $match: { 
          userId, 
          createdAt: { $gte: fourWeeksAgo } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ])

    return NextResponse.json({
      totalQuestions,
      recentQuestions,
      tagDistribution,
      difficultyDistribution,
      weeklyTrend,
    })
  } catch (error) {
    console.error("통계 조회 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}