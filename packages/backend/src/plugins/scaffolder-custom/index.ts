/**
 * Custom Scaffolder Module
 * 
 * This module adds custom actions to the scaffolder backend
 */

import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { coreServices } from '@backstage/backend-plugin-api';
import { createHarborProjectAction } from './actions/harbor-create-project';
import { createHarborRobotAccountAction } from './actions/harbor-create-robot-account';

const scaffolderModuleCustomActions = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'custom-actions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        // Register Harbor actions
        scaffolder.addActions(
          createHarborProjectAction({ config }),
          createHarborRobotAccountAction({ config }),
        );
      },
    });
  },
});

export default scaffolderModuleCustomActions;
