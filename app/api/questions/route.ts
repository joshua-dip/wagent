import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import QuestionModel from "@/models/Question"

// GET /api/questions - 문제 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const tag = searchParams.get("tag") || ""
    const difficulty = searchParams.get("difficulty") || ""

    const skip = (page - 1) * limit

    // 필터 구성
    const filter: any = { userId: session.user.email }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ]
    }
    
    if (tag) {
      filter.tags = { $in: [tag] }
    }
    
    if (difficulty) {
      filter.difficulty = difficulty
    }

    const [questions, total] = await Promise.all([
      QuestionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuestionModel.countDocuments(filter),
    ])

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("문제 목록 조회 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

// POST /api/questions - 새 문제 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, expectedAnswer, gradingCriteria, difficulty, tags } = body

    // 입력 데이터 검증
    if (!title || !content || !expectedAnswer || !gradingCriteria || !difficulty || !tags?.length) {
      return NextResponse.json({ error: "필수 필드가 누락되었습니다" }, { status: 400 })
    }

    await connectDB()

    const question = await QuestionModel.create({
      title,
      content,
      expectedAnswer,
      gradingCriteria,
      difficulty,
      tags,
              userId: session.user.email,
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error("문제 생성 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}