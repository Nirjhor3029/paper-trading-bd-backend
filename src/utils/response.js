/**
 * Response Formatter
 * Ensures consistent API response format across all endpoints
 * Follows JSON:API spec inspired format
 */
class ResponseFormatter {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Created response (201)
   * @param {Object} res - Express response object
   * @param {*} data - Created resource
   * @param {string} message - Success message
   */
  static created(res, data, message = 'Resource created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * No Content response (204)
   * @param {Object} res - Express response object
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Array} details - Additional error details
   */
  static error(res, message = 'Error occurred', statusCode = 500, details = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Not Found response (404)
   * @param {Object} res - Express response object
   * @param {string} resource - Resource name
   */
  static notFound(res, resource = 'Resource') {
    return ResponseFormatter.error(res, `${resource} not found`, 404);
  }

  /**
   * Validation Error response (422)
   * @param {Object} res - Express response object
   * @param {Array} details - Validation error details
   */
  static validationError(res, details) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Page data
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   * @param {string} message - Success message
   */
  static paginated(res, data, page, limit, total, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ResponseFormatter;
