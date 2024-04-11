import mongoose, { Document, Model, Schema } from "mongoose";

interface IComment extends Document {
  user: object;
  comment: string;
  commentReplies?: IComment[];
}

interface IReview extends Document {
  user: object;
  comment: string;
  rating: number;
  commentReplies: IComment[];
}

interface ILink extends Document {
  title: string;
  url: string;
}

interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
}

interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  preRequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchased?: number;
}
const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    default: 0,
    type: Number,
  },
  comment: String,
});

const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});

const commentSchema = new Schema<IComment>({
  user: Object,
  commentReplies: [Object],
  comment: String,
});

const courseDataSchema = new Schema<ICourseData>({
  videoUrl: String,
  videoThumbnail: Object,
  title: String,
  videoSection: String,
  description: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
});

const courseSchema = new Schema<ICourse>(
  {
    name: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    price: {
      required: true,
      type: Number,
    },
    estimatedPrice: Number,
    thumbnail: {
      public_id: {
        required: true,
        type: String,
      },
      url: {
        required: true,
        type: String,
      },
    },
    tags: {
      required: true,
      type: String,
    },
    level: {
      required: true,
      type: String,
    },
    demoUrl: {
      required: true,
      type: String,
    },
    benefits: [{ title: String }],
    preRequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;
