import { addRatingToReview, deleteReview, getAllReviews, getReviewsByProduct } from "../controllers/review.controller";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.get("/reviewsByProduct/:productId", getReviewsByProduct);

router.post("/addRatingToReview", addRatingToReview);

router.delete("/deleteReview", deleteReview);

router.get("/allReviews", getAllReviews);

export default router;