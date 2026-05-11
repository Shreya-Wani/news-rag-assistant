import mongoose from "mongoose";

const newsArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: [
        "technology",
        "business",
        "science",
        "health",
        "sports",
        "politics",
        "entertainment",
        "world",
        "other",
      ],
      default: "other",
    },
    publishedAt: {
      type: Date,
      required: true,
    },
    isEmbedded: {
      type: Boolean,
      default: false,
    },
    pineconeId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
newsArticleSchema.index({ publishedAt: -1 });
newsArticleSchema.index({ category: 1, publishedAt: -1 });

const NewsArticle = mongoose.model("NewsArticle", newsArticleSchema);

export default NewsArticle;
