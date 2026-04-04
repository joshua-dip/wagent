import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

/** 제목·설명에 포함되는 연·월 문자열 (examRound 쿼리 키와 대응) */
const MOCK_EXAM_TITLE_NEEDLES: Record<string, string> = {
  "26-03": "26년 3월",
  "26-06": "26년 6월",
  "26-09": "26년 9월",
  "25-06": "25년 6월",
  "25-10": "25년 10월",
  "24-06": "24년 6월",
  "24-09": "24년 9월",
  "24-11": "24년 11월",
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const PRODUCT_LIST_PROJECT = {
  title: 1,
  description: 1,
  price: 1,
  originalPrice: 1,
  category: 1,
  tags: 1,
  author: 1,
  createdAt: 1,
  fileSize: 1,
  downloadCount: 1,
  rating: 1,
  reviewCount: 1,
  isActive: 1,
  originalFileName: 1,
  hwpFilePath: 1,
  hwpOriginalFileName: 1,
} as const;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const isFree = searchParams.get('free'); // 무료 상품 필터
    const excludeFree = searchParams.get('excludeFree') === 'true'; // 유료만 (서술형 목록용)
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const showAll = searchParams.get('showAll'); // 관리자용: 모든 상품 표시
    const fileFormat = searchParams.get('fileFormat'); // all | pdf | hwp
    const sortBy = searchParams.get('sortBy') || 'latest';
    const examRound = searchParams.get('examRound'); // e.g. 26-03
    const grade = searchParams.get('grade'); // 1 | 2 | 3 → 고1 고2 고3

    // 필터 조건 구성
    const filter: Record<string, unknown> = {};
    
    // 관리자가 아닌 경우에만 활성 상품만 필터링
    if (showAll !== 'true') {
      filter.isActive = true;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (isFree === 'true') {
      filter.price = 0;
    } else if (excludeFree) {
      filter.price = { $gt: 0 };
    }

    if (tag) {
      filter.tags = { $in: tag.split(',') };
    }

    const andClauses: object[] = [];

    if (search) {
      andClauses.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }

    if (fileFormat === 'pdf') {
      andClauses.push({ originalFileName: { $regex: /\.pdf$/i } });
    } else if (fileFormat === 'hwp') {
      andClauses.push({
        $or: [
          { hwpFilePath: { $exists: true, $nin: [null, ''] } },
          { originalFileName: { $regex: /\.hwp$/i } }
        ]
      });
    }

    if (examRound && examRound !== 'all') {
      const needle = MOCK_EXAM_TITLE_NEEDLES[examRound];
      if (needle) {
        const rx = escapeRegex(needle);
        andClauses.push({
          $or: [
            { title: { $regex: rx, $options: 'i' } },
            { description: { $regex: rx, $options: 'i' } },
          ],
        });
      }
    }

    if (grade && grade !== 'all') {
      const label =
        grade === '1' ? '고1' : grade === '2' ? '고2' : grade === '3' ? '고3' : '';
      if (label) {
        const rx = escapeRegex(label);
        andClauses.push({
          $or: [
            { tags: label },
            { title: { $regex: rx, $options: 'i' } },
            { description: { $regex: rx, $options: 'i' } },
          ],
        });
      }
    }

    if (andClauses.length > 0) {
      filter.$and = andClauses;
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    const useQuestionSort = sortBy === "questionAsc" || sortBy === "questionDesc";

    let products: Record<string, unknown>[];

    if (useQuestionSort) {
      const sentinel = sortBy === "questionAsc" ? 999999 : -1;
      const sortStage =
        sortBy === "questionAsc"
          ? { questionSortKey: 1 as const, createdAt: -1 as const }
          : { questionSortKey: -1 as const, createdAt: -1 as const };

      products = await Product.aggregate([
        { $match: filter },
        {
          $addFields: {
            questionSortKey: {
              $let: {
                vars: {
                  rRange: {
                    $regexFind: {
                      input: "$title",
                      regex: "(\\d+)\\s*~\\s*\\d+번",
                    },
                  },
                },
                in: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ["$$rRange", null] },
                        {
                          $gte: [
                            { $size: { $ifNull: ["$$rRange.captures", []] } },
                            1,
                          ],
                        },
                      ],
                    },
                    then: {
                      $toInt: { $arrayElemAt: ["$$rRange.captures", 0] },
                    },
                    else: {
                      $let: {
                        vars: {
                          rSingle: {
                            $regexFind: {
                              input: "$title",
                              regex: "(\\d+)번",
                            },
                          },
                        },
                        in: {
                          $cond: {
                            if: {
                              $and: [
                                { $ne: ["$$rSingle", null] },
                                {
                                  $gte: [
                                    {
                                      $size: {
                                        $ifNull: ["$$rSingle.captures", []],
                                      },
                                    },
                                    1,
                                  ],
                                },
                              ],
                            },
                            then: {
                              $toInt: {
                                $arrayElemAt: ["$$rSingle.captures", 0],
                              },
                            },
                            else: null,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $addFields: {
            questionSortKey: { $ifNull: ["$questionSortKey", sentinel] },
          },
        },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
        { $project: PRODUCT_LIST_PROJECT },
      ]);
    } else {
      products = await Product.find(filter)
        .select(
          "title description price originalPrice category tags author createdAt fileSize downloadCount rating reviewCount isActive originalFileName hwpFilePath hwpOriginalFileName"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    // 전체 개수 조회
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        category,
        isFree: isFree === 'true',
        excludeFree: excludeFree || undefined,
        search,
        examRound: examRound && examRound !== 'all' ? examRound : undefined,
        grade: grade && grade !== 'all' ? grade : undefined,
        fileFormat: fileFormat === 'pdf' || fileFormat === 'hwp' ? fileFormat : undefined,
        sortBy: useQuestionSort ? sortBy : undefined,
      }
    });

  } catch (error) {
    console.error("상품 목록 조회 오류:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "상품 목록을 불러오는 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
}