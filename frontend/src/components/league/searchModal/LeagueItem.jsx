import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../../store/ui/ui-slice.js';

import './LeagueItem.css';

const LeagueItem = ({ id, name, dateCreated }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleShowLeague = () => {
        dispatch(uiActions.hideLeaguesModal());
        navigate(`/leagues/${id}`, {
            state: { id, leagueName: name, dateCreated },
        });
    };

    return (
        <li onClick={handleShowLeague} className="league-list__item">
            <p>{name}</p>
            <p>{dateCreated}</p>
        </li>
    );
};

export default LeagueItem;
