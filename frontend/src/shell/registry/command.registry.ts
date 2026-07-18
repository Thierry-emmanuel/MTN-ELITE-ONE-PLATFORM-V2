import type { PaletteCommand } from './types';
import { getModules } from './module.registry';

const globalCommands: PaletteCommand[] = [];
let pageCommands: PaletteCommand[] = [];

export const registerGlobalCommands = (cmds: PaletteCommand[]) => {
  globalCommands.push(...cmds);
};

/** The active surface declares its contextual commands ("On this page"). */
export const setPageCommands = (cmds: PaletteCommand[]) => { pageCommands = cmds; };
export const clearPageCommands = () => { pageCommands = []; };

export const getAllCommands = (): PaletteCommand[] => [
  ...pageCommands.map((c) => ({ section: 'Sur cette page', ...c })),
  ...globalCommands,
  ...getModules().flatMap((m) => m.commands ?? []),
];
