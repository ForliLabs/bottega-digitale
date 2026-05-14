// Barrel export for validation schemas
export {
  mediaFolderSchema,
  mediaUploadSchema,
  mediaFileSchema,
  mediaDeleteSchema,
  mediaLibraryQuerySchema,
  ALLOWED_MIME_TYPES,
  MEDIA_FOLDERS,
} from "./media";
export type { MediaUploadInput, MediaFileInput, MediaDeleteInput, MediaLibraryQuery } from "./media";

export {
  whatsappAiMessageSchema,
  whatsappAiPersonalitySchema,
  whatsappAiConfigSchema,
} from "./whatsapp-ai";
export type { WhatsappAiMessageInput, WhatsappAiConfigInput } from "./whatsapp-ai";

export {
  createBookingSchema,
  updateBookingSchema,
  bookingIdSchema,
  BOOKING_STATUSES,
  BOOKING_CHANNELS,
} from "./bookings";
export type { CreateBookingInput, UpdateBookingInput } from "./bookings";

export {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
} from "./customers";
export type { CreateCustomerInput, UpdateCustomerInput } from "./customers";

export {
  createProductSchema,
  updateProductSchema,
} from "./products";
export type { CreateProductInput, UpdateProductInput } from "./products";

export {
  createOrderSchema,
  updateOrderStatusSchema,
  orderItemSchema,
  ORDER_STATUSES,
  ORDER_CHANNELS,
} from "./orders";
export type { CreateOrderInput, UpdateOrderStatusInput } from "./orders";
