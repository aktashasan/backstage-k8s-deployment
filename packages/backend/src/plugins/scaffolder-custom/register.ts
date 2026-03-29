/**
 * Register Custom Scaffolder Actions
 * 
 * This file registers custom actions with the scaffolder backend.
 * 
 * NOTE: Backstage'in yeni backend system'inde custom actions eklemek için
 * scaffolder backend'i özelleştirmemiz gerekiyor. Bu dosya bir örnek olarak
 * hazırlanmıştır. Backstage dokümantasyonuna göre güncellenmelidir.
 */

import { Config } from '@backstage/config';
import { createHarborProjectAction } from './actions/harbor-create-project';
import { createHarborRobotAccountAction } from './actions/harbor-create-robot-account';

/**
 * Get all custom actions
 * 
 * Bu fonksiyon tüm custom actions'ları döndürür.
 * Backend'de scaffolder plugin'ine register edilmelidir.
 */
export function getCustomActions(config: Config) {
  return [
    createHarborProjectAction({ config }),
    createHarborRobotAccountAction({ config }),
  ];
}
