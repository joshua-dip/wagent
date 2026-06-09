import mongoose, { Schema, Document } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string; // sanitized HTML
  coverImage?: string;
  tags: string[];
  status: "draft" | "published";
  productId?: string; // optional linkage to a product
  authorEmail: string;
  authorName: string;
  views: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    excerpt: { type: String, maxlength: 500 },
    content: { type: String, required: true },
    coverImage: { type: String },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    productId: { type: String },
    authorEmail: { type: String, required: true },
    authorName: { type: String, required: true },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogPostSchema.index({ title: "text", excerpt: "text", tags: "text" });
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ createdAt: -1 });

const BlogPost =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
export default BlogPost;
