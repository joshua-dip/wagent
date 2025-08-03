import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import QuestionModel from "@/models/Question"

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/questions/[id] - 특정 문제 조회
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const question = await QuestionModel.findOne({
      _id: id,
      userId: session.user.email,
    }).lean()

    if (!question) {
      return NextResponse.json({ error: "문제를 찾을 수 없습니다" }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("문제 조회 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

// PUT /api/questions/[id] - 문제 수정
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, expectedAnswer, gradingCriteria, difficulty, tags } = body

    await connectDB()

    const { id } = await params
    const question = await QuestionModel.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      {
        title,
        content,
        expectedAnswer,
        gradingCriteria,
        difficulty,
        tags,
      },
      { new: true, runValidators: true }
    )

    if (!question) {
      return NextResponse.json({ error: "문제를 찾을 수 없습니다" }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("문제 수정 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

// DELETE /api/questions/[id] - 문제 삭제
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const question = await QuestionModel.findOneAndDelete({
      _id: id,
      userId: session.user.email,
    })

    if (!question) {
      return NextResponse.json({ error: "문제를 찾을 수 없습니다" }, { status: 404 })
    }

    return NextResponse.json({ message: "문제가 삭제되었습니다" })
  } catch (error) {
    console.error("문제 삭제 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}