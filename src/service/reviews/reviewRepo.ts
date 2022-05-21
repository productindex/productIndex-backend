import { Review } from "./reviewType";
import db from "../../models";

const findReviewsByBusinessId = async (business_id: number) => {
  const review = await db.Review.findAll({ include:[{model: db.Business}], where: { id: business_id } });
  if (!review) {
    return;
  }
  return review.dataValues;
};

const findReviewsByStoreId = async (store_id: number) => {
    const review = await db.Review.findAll({ where: { store_id: store_id } });
    if (!review) {
      return;
    }
    return review.dataValues;
  };

const findReviewsByUserId = async (userId: number) => {
  const reviews = await db.Review.findAll({
    where: { user_id: userId },
    raw: true,
  });
  if (!reviews) {
    return;
  }

  return reviews;
};

const findReview = async (userId: number, store_id: number) => {
  console.log(db.Review);
  const review = await db.Review.findOne({
    where: { store_id: store_id, user_id: userId },
  });

  if (!review) {
    return;
  }
  return review;
};

const findUserStoreReview = async (userId: number, store_id: number) => {
    const review = await db.Review.findOne({ where: { store_id: store_id, user_id: userId }})
    if (!review) {
        return 
    }
    return review
}

const createReview = async (newReview: Review) => {
  await db.Review.create({
    user_id: newReview.user_id,
    store_id: newReview.store_id,
    rating_number: newReview.rating_number,
    comment: newReview.comment,
    insert_date: Date.now(),
  });
  return newReview;
};

const updateReviewByUserId = async (updatedReview: Review) => {
  const review = await db.Review.findOne({where: {user_id:updatedReview.user_id, store_id:updatedReview.store_id}});
  if (!review) {
    return;
  }
  review.update({
    comment: updatedReview.comment,
    flag_reason: updatedReview.flag_reason,
    inappropriate_flag: updatedReview.inappropriate_flag,
  });

  return updatedReview;
};

const updateReview = async (updatedReview: Review) => {
    const review = await db.Review.findByPk(updatedReview.id)
    if (!review) {
        return
    }
    review.update({
        comment: updatedReview.comment,
        flag_reason: updatedReview.flag_reason,
        inappropriate_flag: updatedReview.inappropriate_flag,
        rating_number: updatedReview.rating_number,
        deleted_date: updatedReview.deleted_date,
    })

  return updatedReview;
};

const deleteReview = async (review_id: number) => {
  const review = await db.Review.findByPk(review_id);
  if (!review) {
    return;
  }
  review.destroy();
  return review;
};

const deleteReviewByUserId = async (user_id: number, store_id: number) => {
    const review = await db.Review.findOne({where: {user_id:user_id, store_id:store_id}});
    if (!review) {
      return;
    }
    review.destroy();
    return review;
  };

module.exports = {
  findReviewsByBusinessId,
  findReview,
  createReview,
  updateReview,
  deleteReview,
  findReviewsByUserId,
  updateReviewByUserId,
  deleteReviewByUserId,
  findReviewsByStoreId
};
