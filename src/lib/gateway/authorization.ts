import { AuthorizationCheck, RolePermissions } from '../types';

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  inventory_agent: {
    role: 'inventory_agent',
    allowedTools: ['inventory_lookup', 'supplier_search', 'create_purchase_order'],
    forbiddenTools: ['change_supplier_payment_details', 'delete_supplier', 'modify_bank_credentials', 'override_credit_limit'],
  },
};

export function checkAuthorization(role = 'inventory_agent', toolName: string): AuthorizationCheck {
  const roleConfig = ROLE_PERMISSIONS[role] || {
    role,
    allowedTools: [],
    forbiddenTools: ['*'],
  };

  if (roleConfig.forbiddenTools.includes(toolName) || roleConfig.forbiddenTools.includes('*')) {
    return {
      passed: false,
      role,
      tool: toolName,
      reason: `SECURITY VIOLATION: Role '${role}' is explicitly forbidden from invoking restricted action '${toolName}'.`,
    };
  }

  if (!roleConfig.allowedTools.includes(toolName)) {
    return {
      passed: false,
      role,
      tool: toolName,
      reason: `AUTHORIZATION DENIED: Action '${toolName}' is not present in whitelist for role '${role}'.`,
    };
  }

  return {
    passed: true,
    role,
    tool: toolName,
    reason: `RBAC PASS: Role '${role}' authorized for action '${toolName}'.`,
  };
}
