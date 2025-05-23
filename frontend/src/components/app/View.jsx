import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import StandingDetails from '../league/StandingDetails.jsx';
import Standings from '../league/Standings.jsx';
import FixtureList from '../fixture/FixtureList.jsx';
import TabList from '../tab/TabList.jsx';
import ResultList from '../result/ResultList.jsx';
import './View.css';

// This is a shared component for standings, fixtures and results
const View = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab');
    const [tab, setTab] = useState(initialTab || 'standings');

    const setTabParam = (value) => {
        // updating the url search params causes re rendering from the first component of the route
        // searchParams.set('tab', value);
        // setSearchParams(searchParams);
    };

    const handleStandingsTab = () => {
        setTabParam('standings');
        setTab('standings');
    };

    const handleFixturesTab = () => {
        setTabParam('fixtures');
        setTab('fixtures');
    };

    const handleResultsTab = () => {
        setTabParam('results');
        setTab('results');
    };

    const tabHandlers = {
        onStandings: handleStandingsTab,
        onFixtures: handleFixturesTab,
        onResults: handleResultsTab,
    };

    return (
        <main>
            <div className="view__header">
                <StandingDetails />
                <TabList tab={tab} {...tabHandlers} />
            </div>
            {tab === 'standings' && <Standings />}
            {tab === 'fixtures' && <FixtureList />}
            {tab === 'results' && <ResultList />}
        </main>
    );
};

export default View;
