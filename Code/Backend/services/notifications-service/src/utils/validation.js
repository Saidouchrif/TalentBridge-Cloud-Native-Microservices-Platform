// Schémas de validation Zod pour les notifications-service
const { z } = require('zod');

/**
 * Schéma pour créer une notification
 */
const createNotificationSchema = z.object({
  userId: z.number().int().positive('userId doit être un entier positif'),
  type: z.enum([
    'registration',
    'profile_update',
    'new_offer',
    'application_status',
    'admin_alert',
    'document_generated',
    'message',
    'event'
  ], { message: 'Type de notification invalide' }),
  message: z.string().min(1, 'Message requis').max(1000, 'Message trop long'),
  canal: z.enum(['email', 'in-app', 'push']).optional().default('in-app'),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional().default('normal'),
  relatedEntityId: z.number().int().optional(),
  relatedEntityType: z.string().max(50).optional()
});

/**
 * Schéma pour mettre à jour les préférences de notification
 */
const updatePreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  preferredLanguage: z.enum(['fr', 'en']).optional(),
  notificationFrequency: z.enum(['immediate', 'daily_summary', 'weekly_summary']).optional()
});

/**
 * Middleware de validation Zod
 */
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          message: 'Erreur de validation',
          errors
        });
      }
      next(err);
    }
  };
}

module.exports = {
  createNotificationSchema,
  updatePreferencesSchema,
  validateRequest
};
