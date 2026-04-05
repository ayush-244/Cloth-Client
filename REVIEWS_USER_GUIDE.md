# How Users Add Reviews in Cloth Rental Platform

## Complete End-to-End User Flow

### prerequisites
1. **User must be logged in** 
2. **User must have a COMPLETED rental** (status = 'returned')
3. **Can only review products they rented**
4. **One review per rental order**

---

## Step-by-Step: How a User Adds a Review

### Step 1: Navigate to Product Details
- User clicks on a product in the listings
- URL: `/product/:productId`
- Page loads product information

### Step 2: ProductDetails Page Fetches User Bookings
```javascript
// Inside ProductDetails.tsx
useEffect(() => {
  const fetchUserBookings = async () => {
    const response = await api.get('/api/bookings/my');
    if (response.data.success) {
      setUserBookings(response.data.data);  // Gets user's all bookings
    }
  };
  
  if (isAuthenticated) fetchUserBookings();
}, [isAuthenticated]);
```

**What this does**: Fetches all the user's bookings to check which ones are completed.

### Step 3: ReviewsSection Looks for Eligible Bookmark
```javascript
// Inside ReviewsSection.tsx
const completedBooking = userBookings.find(
  booking => booking.productId === productId && 
             booking.status === 'returned'  // Must be 'returned' status
);
```

**What this checks**:
- ✅ Does user have a booking for THIS product?
- ✅ Is that booking status = 'returned' (rental complete)?
- ❌ If no → Show "Complete a Rental to Review" message

### Step 4: Show "Share Your Review" Button
If user has a completed booking:
```typescript
{isAuthenticated && completedBooking && (
  <button onClick={() => setShowReviewForm(true)}>
    Share Your Review
  </button>
)}
```

### Step 5: Review Form Displays
When user clicks "Share Your Review", ReviewForm appears with:
- **Star Rating**: Select 1-5 stars
- **Comment**: Optional text (max 1000 chars)
- **Validation**: Rating is required

### Step 6: User Submits Review

**Frontend**:
```javascript
// ReviewForm.tsx onSubmit
const handleSubmit = async () => {
  const success = await onSubmit({
    rating: 4,  // Selected rating
    comment: "Great quality and fit!"
  });
};

// ReviewsSection.tsx receives this and calls:
const result = await createReview({
  productId: "69d25821dcfa59d9d9c046a7",
  orderId: "completedBooking._id",  // THIS booking ID
  rating: 4,
  comment: "Great quality and fit!"
});
```

### Step 7: Backend Validates & Creates Review

**Backend API**: `POST /api/reviews`
```javascript
// review.controller.js
export const createReview = async (req, res, next) => {
  const { productId, orderId, rating, comment } = req.body;
  const userId = req.user.id;  // From JWT token
  
  // review.service.js does:
  // 1. Check eligibility (user owns order, order status = 'returned')
  // 2. Check for duplicate reviews (only 1 review per order)
  // 3. Create review in MongoDB
  // 4. Update product rating denormalization
  // 5. Return review with user details
};
```

**Validations**:
- ✅ User owns the booking
- ✅ Booking status is 'returned'
- ✅ No existing review for this order ID
- ✅ Rating is 1-5
- ✅ Comment not exceeding 1000 chars

**Response**:
```javascript
{
  success: true,
  data: {
    _id: "review_id",
    productId: "product_id",
    orderId: "booking_id",
    userId: "user_id",
    rating: 4,
    comment: "Great quality and fit!",
    helpful: 0,
    unhelpful: 0,
    createdAt: "2026-04-05T...",
    updatedAt: "2026-04-05T..."
  }
}
```

### Step 8: Frontend Updates
- Form closes
- Review list refreshes with new review
- Rating distribution updates
- "Share Your Review" button disappears
- Review appears in the list marked as "Your Review"

---

## UI States & Messages

### Can Review ✅
**Conditions**:
- User logged in
- Has a booking with status = 'returned'
- No existing review

**Display**:
```
[Share Your Review] Button
↓
[Review Form]
```

### Cannot Review - Not Logged In ❌
**Message**: "Sign In to Review - Please sign in to share your experience with this product"

### Cannot Review - No Completed Rental ❌
**Message**: "Complete a Rental to Review - Only customers who completed rentals can review this product"

### Already Reviewed ✅
**Conditions**:
- User has existing review
- Shows review with user's rating and comment
- Can edit or delete their review

**Display**:
```
[Your Review]
Rating: ⭐⭐⭐⭐ (4 stars)
Comment: "Great quality and fit!"
[Edit] [Delete]
```

---

## Complete Request/Response Cycle

### 1. Fetch User Bookings
```
GET /api/bookings/my
Authorization: Bearer <jwt_token>

Response:
{
  success: true,
  data: [
    {
      _id: "booking1",
      productId: "product1",
      status: 'returned',  // ← User can review this
      userId: "user1",
      ...
    },
    {
      _id: "booking2",
      productId: "product1",
      status: 'booked',  // ← User CANNOT review this
      userId: "user1",
      ...
    }
  ]
}
```

### 2. Check Review Eligibility (Optional)
```
GET /api/reviews/check/:productId/:orderId
Authorization: Bearer <jwt_token>

Response:
{
  success: true,
  data: {
    canReview: true,
    reason: "",
    hasReviewed: false
  }
}
```

### 3. Create Review
```
POST /api/reviews
Authorization: Bearer <jwt_token>
Content-Type: application/json

Body:
{
  productId: "69d25821dcfa59d9d9c046a7",
  orderId: "booking_id",
  rating: 4,
  comment: "Great quality and fit!"
}

Response:
{
  success: true,
  data: {
    _id: "review_id",
    productId: "product_id",
    orderId: "booking_id",
    userId: {
      _id: "user_id",
      name: "John Doe"
    },
    rating: 4,
    comment: "Great quality and fit!",
    helpful: 0,
    unhelpful: 0,
    createdAt: "2026-04-05T10:30:00Z"
  }
}
```

### 4. Fetch Reviews List
```
GET /api/reviews/product/:productId?page=1&limit=10&sortBy=recent
Authorization: Optional (public endpoint)

Response:
{
  success: true,
  data: {
    reviews: [
      {
        _id: "review1",
        rating: 5,
        comment: "Excellent!",
        userId: { name: "Alice" },
        helpful: 3,
        unhelpful: 0,
        createdAt: "2026-04-05T..."
      },
      {
        _id: "review2",
        rating: 4,
        comment: "Very good",
        userId: { name: "Bob" },
        helpful: 1,
        unhelpful: 0,
        createdAt: "2026-04-04T..."
      }
    ],
    stats: {
      averageRating: 4.5,
      totalReviews: 2,
      ratingDistribution: {
        5: 1,
        4: 1,
        3: 0,
        2: 0,
        1: 0
      }
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      pages: 1
    }
  }
}
```

---

## Error Scenarios

### Scenario 1: User Not Authenticated
```
Frontend: POST /api/reviews without Authorization header
Backend: Returns 401 Unauthorized → Redirects to login
```

### Scenario 2: Booking Status Not "Returned"
```
Frontend: Checks booking.status
Result: Show "Complete a Rental to Review" message
Form: Not displayed
```

### Scenario 3: User Already Reviewed
```
Frontend: Fetches user's existing review with getUserReview()
Result: Show existing review instead of form
Form: Hidden, "Share Your Review" button hidden
```

### Scenario 4: Invalid Rating (0 or > 5)
```
Frontend: ReviewForm validates rating > 0
Backend: Joi schema validates 1 ≤ rating ≤ 5
Result: Form stays open with error message
```

### Scenario 5: Comment Exceeds 1000 Chars
```
Frontend: TextArea shows character count, disables submit
Backend: Joi schema has maxlength: 1000
Result: Returns 400 Validation failed
```

---

## Component Hierarchy

```
ProductDetails
├── Fetches: User bookings from /api/bookings/my
├── Finds: completedBooking (status = 'returned')
└── Passes: userBookings to ReviewsSection

ReviewsSection
├── Finds: completedBooking for this product
├── Shows: ReviewForm (if eligible)
├── Shows: Review list
└── Manages: Review submission and updates

ReviewForm
├── Inputs: Rating (required) + Comment (optional)
├── Submits: createReview API call
└── Displays: Success message or error

ReviewList
├── Displays: All reviews for product
├── Shows: Your review highlighted
└── Allows: Edit/Delete your own review
```

---

## Database Flow

### 1. Booking Created
```javascript
Booking {
  _id: ObjectId,
  userId: ObjectId,
  productId: ObjectId,
  status: 'booked'  // starts here
}
```

### 2. Rental Completed
```javascript
Booking {
  _id: ObjectId,
  userId: ObjectId,
  productId: ObjectId,
  status: 'returned'  // ← THEN user can review
}
```

### 3. Review Created
```javascript
Review {
  _id: ObjectId,
  userId: ObjectId,
  productId: ObjectId,
  orderId: ObjectId,  // Links to Booking
  rating: 1-5,
  comment: String,
  helpful: Number,
  unhelpful: Number,
  createdAt: Date
}
```

### 4. Product Denormalization Updated
```javascript
Product {
  _id: ObjectId,
  name: String,
  ...
  averageRating: 4.5,           // Calculated from all reviews
  totalReviews: 10,             // Count of reviews
  ratingDistribution: {
    5: 3,
    4: 4,
    3: 2,
    2: 1,
    1: 0
  }
}
```

---

## Key Points Summary

| Aspect | Details |
|--------|---------|
| **Can review?** | Must have booking with status = 'returned' |
| **One review per** | Order/Booking ID (enforced by unique constraint) |
| **Required fields** | rating (1-5) |
| **Optional fields** | comment (max 1000 chars) |
| **Auth required** | Yes (JWT token) |
| **Response time** | Should be < 1s |
| **Validation** | Frontend + Backend |
| **UI Feedback** | Form closes, list updates, success shown |

---

## Testing the Review Feature

### Test Case 1: Add Review (Happy Path)
1. Login
2. Go to Product Details
3. Click "Share Your Review"
4. Select 4 stars
5. Type comment
6. Click submit
7. ✅ Review appears in list

### Test Case 2: Cannot Review Without Completed Rental
1. Login
2. Go to Product Details (no completed booking)
3. ❌ No "Share Your Review" button
4. ✅ Message: "Complete a Rental to Review"

### Test Case 3: Cannot Review While Not Logged In
1. Logout / Don't login
2. Go to Product Details
3. ❌ No "Share Your Review" button
4. ✅ Message: "Sign In to Review"

### Test Case 4: Edit Existing Review
1. Go to Product Details (with existing review)
2. ✅ See your review
3. Click [Edit]
4. Change rating or comment
5. Click submit
6. ✅ Review updated

### Test Case 5: Delete Review
1. Go to Product Details (with existing review)
2. ✅ See your review
3. Click [Delete]
4. Confirm deletion
5. ✅ Review removed from list
6. ✅ "Share Your Review" button reappears
