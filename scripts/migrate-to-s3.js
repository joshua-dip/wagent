// 기존 로컬 파일을 S3로 마이그레이션하는 스크립트
const fs = require('fs');
const path = require('path');
const { uploadFileToS3 } = require('../src/lib/s3Config');
const connectDB = require('../src/lib/db');
const Product = require('../src/models/Product');

async function migrateToS3() {
  console.log('🚀 로컬 파일을 AWS S3로 마이그레이션 시작...');
  
  try {
    await connectDB();
    
    // 로컬에 저장된 상품들 조회
    const products = await Product.find({ 
      filePath: { $regex: '^uploads/products/' } // 로컬 경로만
    });
    
    console.log(`📦 마이그레이션할 상품: ${products.length}개`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        const localPath = path.join(process.cwd(), product.filePath);
        
        if (!fs.existsSync(localPath)) {
          console.log(`❌ 파일 없음: ${product.title} - ${localPath}`);
          errorCount++;
          continue;
        }
        
        // 로컬 파일 읽기
        const fileBuffer = fs.readFileSync(localPath);
        
        // S3에 업로드
        const s3Key = await uploadFileToS3(
          fileBuffer, 
          product.originalFileName, 
          'application/pdf'
        );
        
        // 데이터베이스 업데이트
        await Product.findByIdAndUpdate(product._id, {
          filePath: s3Key,
          fileName: s3Key.split('/').pop()
        });
        
        console.log(`✅ 성공: ${product.title} -> ${s3Key}`);
        successCount++;
        
      } catch (error) {
        console.log(`❌ 실패: ${product.title} - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 마이그레이션 완료!`);
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    
  } catch (error) {
    console.error('💥 마이그레이션 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateToS3();
}

module.exports = { migrateToS3 };