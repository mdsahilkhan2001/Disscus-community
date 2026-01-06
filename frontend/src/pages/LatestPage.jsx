import React from 'react';
import HomePage from './HomePage';

const LatestPage = () => {
    // Since default lists are ordered by created_at desc, Latest and Home are similar for now.
    // If Home becomes "Popular" (sorted by votes), Latest would remain just date sorted.
    // For now, reusing HomePage logic is acceptable.
    return <HomePage />;
};

export default LatestPage;
