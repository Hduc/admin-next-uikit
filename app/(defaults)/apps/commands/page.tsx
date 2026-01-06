import ComponentsAppsCommands from '@/components/apps/commands/components-apps-commands';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Commands & Tricks',
};

const CommandsPage = () => {
    return <ComponentsAppsCommands />;
};

export default CommandsPage;
