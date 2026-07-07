import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../styles/designSystem';
import Button from './ui/Button';
import Card from './ui/Card';
import EmptyState from './EmptyState';
import RatingStars from './RatingStars';
import Toast from './ui/Toast';
import { Skeleton, SkeletonText } from './ui/Skeleton';

const emptyDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

const getUserId = (user) => user?._id || user?.id || '';

const getReviewUserId = (review) => {
  if (!review?.user) return '';
  return typeof review.user === 'string' ? review.user : getUserId(review.user);
};

const getReviewUserName = (review) => {
  if (!review?.user) return 'ShopEase customer';
  return typeof review.user === 'string' ? 'ShopEase customer' : review.user.name || 'ShopEase customer';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const buildSummary = (reviews) => {
  const ratingDistribution = { ...emptyDistribution };
  reviews.forEach((review) => {
    ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
  });

  const reviewsCount = reviews.length;
  const averageRating = reviewsCount
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount).toFixed(1))
    : 0;

  return { averageRating, reviewsCount, ratingDistribution };
};

const ReviewSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} variant="panel" className="p-5">
        <div className="flex gap-4">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
            <SkeletonText lines={2} />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const ReviewForm = ({ initialRating = 0, initialComment = '', submitLabel, onCancel, onSubmit, submitting }) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
  }, [initialComment, initialRating]);

  const canSubmit = rating > 0 && comment.trim().length >= 3 && !submitting;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({ rating, comment: comment.trim() });
      }}
    >
      <RatingStars value={rating} onChange={setRating} label="Your rating" />
      <div className="space-y-2">
        <label htmlFor="review-comment" className="text-label-sm font-label-sm text-on-surface-variant">
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface shadow-sm outline-none transition-all duration-200 placeholder:text-on-surface-variant focus:border-secondary focus:ring-4 focus:ring-secondary/10"
          placeholder="Share what stood out about this product"
          maxLength={1000}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
};

const ProductReviews = ({ productId, initialSummary, onSummaryChange }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(initialSummary || buildSummary([]));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const currentUserId = getUserId(user);

  const ownReview = useMemo(
    () => reviews.find((review) => getReviewUserId(review) === currentUserId),
    [currentUserId, reviews]
  );

  const publishSummary = (nextReviews, serverSummary) => {
    const nextSummary = serverSummary || buildSummary(nextReviews);
    setSummary(nextSummary);
    onSummaryChange?.(nextSummary);
  };

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/products/${productId}/reviews`);
        const nextReviews = response.data?.data || [];
        setReviews(nextReviews);
        publishSummary(nextReviews, response.data?.summary);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadReviews();
    }
  }, [productId]);

  const handleCreate = async (payload) => {
    if (!user) return;

    const previousReviews = reviews;
    const optimisticReview = {
      _id: `pending-${Date.now()}`,
      user: { _id: currentUserId, name: user.name },
      product: productId,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      optimistic: true,
    };
    const nextReviews = [optimisticReview, ...reviews];

    setReviews(nextReviews);
    publishSummary(nextReviews);
    setSubmitting(true);

    try {
      const response = await api.post(`/products/${productId}/reviews`, payload);
      const savedReview = response.data?.data;
      const savedReviews = nextReviews.map((review) => (review._id === optimisticReview._id ? savedReview : review));
      setReviews(savedReviews);
      publishSummary(savedReviews, response.data?.summary);
      setToast('Review added');
    } catch (submitError) {
      setReviews(previousReviews);
      publishSummary(previousReviews);
      setToast(submitError?.response?.data?.message || 'Unable to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (reviewId, payload) => {
    const previousReviews = reviews;
    const nextReviews = reviews.map((review) =>
      review._id === reviewId
        ? { ...review, ...payload, updatedAt: new Date().toISOString() }
        : review
    );

    setReviews(nextReviews);
    publishSummary(nextReviews);
    setSubmitting(true);

    try {
      const response = await api.put(`/reviews/${reviewId}`, payload);
      const updatedReview = response.data?.data;
      const savedReviews = nextReviews.map((review) => (review._id === reviewId ? updatedReview : review));
      setReviews(savedReviews);
      publishSummary(savedReviews, response.data?.summary);
      setEditingId('');
      setToast('Review updated');
    } catch (submitError) {
      setReviews(previousReviews);
      publishSummary(previousReviews);
      setToast(submitError?.response?.data?.message || 'Unable to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    const previousReviews = reviews;
    const nextReviews = reviews.filter((review) => review._id !== reviewId);

    setReviews(nextReviews);
    publishSummary(nextReviews);

    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      publishSummary(nextReviews, response.data?.summary);
      setToast('Review deleted');
    } catch (submitError) {
      setReviews(previousReviews);
      publishSummary(previousReviews);
      setToast(submitError?.response?.data?.message || 'Unable to delete review');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Customer reviews</p>
          <h2 className="text-headline-lg font-headline-lg text-primary">Product ratings</h2>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 py-2">
          <RatingStars value={summary.averageRating} readonly size="sm" />
          <span className="text-sm font-semibold text-primary">
            {summary.averageRating.toFixed(1)} ({summary.reviewsCount})
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card variant="panel" className="space-y-5 p-6">
          <div>
            <p className="text-display-lg font-display-lg text-primary">{summary.averageRating.toFixed(1)}</p>
            <p className="text-body-md text-on-surface-variant">
              Based on {summary.reviewsCount} review{summary.reviewsCount === 1 ? '' : 's'}
            </p>
          </div>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = summary.ratingDistribution?.[rating] || 0;
              const percent = summary.reviewsCount ? (count / summary.reviewsCount) * 100 : 0;

              return (
                <div key={rating} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3 text-sm text-on-surface-variant">
                  <span>{rating} star</span>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full rounded-full bg-secondary transition-all duration-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card variant="panel" className="p-6">
          {!user ? (
            <EmptyState
              icon="lock"
              title="Sign in to review"
              description="Log in to share your experience with this product."
              actionLabel="Login"
              actionTo="/login"
              className="border-0 bg-transparent p-0 shadow-none"
            />
          ) : ownReview ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-primary">Your review</h3>
                <p className="text-body-md text-on-surface-variant">You can edit or delete your review at any time.</p>
              </div>
              {editingId === ownReview._id ? (
                <ReviewForm
                  initialRating={ownReview.rating}
                  initialComment={ownReview.comment}
                  submitLabel="Update review"
                  submitting={submitting}
                  onSubmit={(payload) => handleUpdate(ownReview._id, payload)}
                  onCancel={() => setEditingId('')}
                />
              ) : (
                <div className="space-y-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                  <RatingStars value={ownReview.rating} readonly />
                  <p className="text-body-md text-on-surface">{ownReview.comment}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setEditingId(ownReview._id)}>
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="text-error" onClick={() => handleDelete(ownReview._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-primary">Write a review</h3>
                <p className="text-body-md text-on-surface-variant">One review is allowed per product.</p>
              </div>
              <ReviewForm submitLabel="Submit review" submitting={submitting} onSubmit={handleCreate} />
            </div>
          )}
        </Card>
      </div>

      {loading ? (
        <ReviewSkeleton />
      ) : error ? (
        <EmptyState icon="error" title="Reviews unavailable" description={error} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon="rate_review"
          title="No reviews yet"
          description="Be the first customer to share a review for this product."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const userName = getReviewUserName(review);
            const canManage = getReviewUserId(review) === currentUserId || user?.role === 'admin';

            return (
              <Card key={review._id} variant="panel" className={cn('p-5 transition-all duration-300', review.optimistic && 'opacity-70')}>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold uppercase text-on-primary">
                    {userName.slice(0, 1)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-body-lg font-body-lg text-primary">{userName}</p>
                        <p className="text-label-sm text-on-surface-variant">{formatDate(review.createdAt)}</p>
                      </div>
                      <RatingStars value={review.rating} readonly size="sm" />
                    </div>
                    <p className="text-body-md leading-7 text-on-surface-variant">{review.comment}</p>
                    {canManage && editingId !== review._id && getReviewUserId(review) !== currentUserId ? (
                      <div className="flex flex-wrap gap-3">
                        <Button type="button" variant="ghost" size="sm" className="text-error" onClick={() => handleDelete(review._id)}>
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Toast message={toast} isVisible={Boolean(toast)} onClose={() => setToast('')} />
    </section>
  );
};

export default ProductReviews;
