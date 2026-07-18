/** FootballOS shell — public surface. */
export { default as ShellApp } from './ShellApp';
export { SHELL_BASE } from './navigation/domains';
export * from './registry/types';
export { registerModule } from './registry/module.registry';
export { registerWidgets } from './registry/widget.registry';
export { registerGlobalCommands } from './registry/command.registry';
export { BuilderHost } from './builder-framework/BuilderHost';
export { useShellPage } from './stores/page.store';
export { useOSContext } from './stores/context.store';
