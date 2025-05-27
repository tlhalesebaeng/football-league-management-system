import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLoaderData, useNavigate } from 'react-router-dom';

import { useFetch } from '../../hooks/useFetch.js';
import { uiActions } from '../../store/ui/ui-slice.js';

import EditField from '../app/EditField.jsx';
import EditTeams from '../team/EditTeams.jsx';
import Button from '../../utils/Button.jsx';
import Backdrop from '../modal/Backdrop.jsx';
import Modal from '../modal/Modal.jsx';
import ConfirmModal from './confirmModal/ConfirmModal.jsx';
import './EditLeagueFields.css';
import { showAlert } from '../../store/ui/alert-slice.js';

const EditLeagueFields = () => {
    const league = useLoaderData();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { request, error, isLoading } = useFetch();
    const [leagueName, setLeagueName] = useState(league.name);
    const showModal = useSelector((state) => state.ui.confirmModalShown);
    const [leagueTeams, setLeagueTeams] = useState([...(league.teams || [])]);

    const handleInputChange = (index, value) => {
        setLeagueTeams((prevTeams) => {
            const newTeams = [...prevTeams];
            newTeams[index] = { ...newTeams[index], name: value };
            return newTeams;
        });
    };

    const handleDeleteTeam = (index) => {
        setLeagueTeams((prevTeams) => prevTeams.filter((_, i) => i !== index));
    };

    const handleAddTeam = () => {
        // TODO: If there is a new team with the same name as the old one then just use the data
        // of the old team because we cannot have teams of similar names
        setLeagueTeams((prevTeams) => [
            ...prevTeams,
            { _id: `t${prevTeams.length}` }, // we need this dummy id to help react to render a list properly
        ]);
    };

    // persist the changes to the backend
    const handlePersistChanges = async (data) => {
        // close the confirm modal so that the loading state can be shown on this component
        dispatch(uiActions.hideConfirmModal());

        // use async functions so that we can rename, delete and add without awaiting for each one of this to finish firstly
        const requestData = []; // holds a list of all the requests we will make

        // add the league name changes to the request data
        if (leagueName !== league.name) {
            requestData.push({
                url: `/leagues/${league._id}`,
                method: 'patch',
                data: { name: leagueName },
            });
        }

        // add the renamed teams to the request data
        const renamedTeams = data.renamed;
        for (let i = 0; i < renamedTeams.length; i++) {
            requestData.push({
                url: `/leagues/${league._id}/teams/${renamedTeams[i]._id}`,
                method: 'patch',
                data: { name: renamedTeams[i].newName },
            });
        }

        // add the new teams to the request data
        const addedTeams = data.added;
        for (let i = 0; i < addedTeams.length; i++) {
            requestData.push({
                url: `/leagues/${league._id}/teams/`,
                method: 'post',
                data: { name: addedTeams[i].name },
            });
        }

        // add deleted teams to the request data
        const deletedTeams = data.deleted;
        for (let i = 0; i < deletedTeams.length; i++) {
            requestData.push({
                url: `/leagues/${league._id}/teams/${deletedTeams[i]._id}`,
                method: 'delete',
            });
        }

        let errorOccured = false;
        // execute the requests all at once
        await Promise.allSettled(
            requestData.map(async (details) => {
                const { url, method, data: someData } = details; // use an aliase for data to avoid naming conflicts
                const responseDetails = await request(url, method, someData);
                if (!responseDetails) errorOccured = true; // the response of the request is undefined when an error occurred
                return responseDetails;
            })
        );

        if (!errorOccured) {
            // set the teams to be the new teams
            league.teams = [...leagueTeams];

            // all request were successful, show a success alert
            dispatch(showAlert('success', 'All changes succeeded'));
        } else {
            // aks user to reload to see changes tha were successful
            dispatch(showAlert('error', 'Please reload page'));
        }
    };

    const handleConfirmChanges = () => {
        dispatch(uiActions.showConfirmModal());
    };

    const handleCancelChanges = () => {
        navigate(`/leagues/${league._id}`);
    };

    const handleCloseModal = () => {
        dispatch(uiActions.hideConfirmModal());
    };

    // checks to disable the save button
    let disableSave = false;
    if (leagueTeams.length < 2) disableSave = true;
    else {
        // TODO: Improve this (linear) search algorithm
        // when there is a team with no name
        for (let i = 0; i < leagueTeams.length; i++) {
            if (!leagueTeams[i].name) {
                disableSave = true;
                break;
            }
        }
    }

    // disable the save buttons when its not and there are no changes found
    if (!disableSave) {
        let changeFound = false;
        // here we are sure that the lengths are equal since we disable save when lengths are not equal
        if (league.name !== leagueName) changeFound = true;
        else if (league.teams.length !== leagueTeams.length) changeFound = true;
        else {
            for (let i = 0; i < leagueTeams.length; i++) {
                if (league.teams[i].name !== leagueTeams[i].name) {
                    changeFound = true;
                    break;
                }
            }
        }

        if (!changeFound) {
            disableSave = true;
        }
    }

    // add league name change to the list of items
    const oldItems = [...league.teams, { _id: league._id, name: league.name }];
    const newItems = [...leagueTeams, { _id: league._id, name: leagueName }];

    return (
        <>
            {showModal && <Backdrop onClose={handleCloseModal} />}
            {showModal && (
                <Modal>
                    <ConfirmModal
                        onConfirm={handlePersistChanges}
                        oldItems={oldItems}
                        newItems={newItems}
                    />
                </Modal>
            )}
            <EditField
                onInputChange={(value) => setLeagueName(value)}
                tag="h2"
                placeholder={league.name}
                value={leagueName}
            />

            <EditTeams
                teams={leagueTeams}
                onInputChange={handleInputChange}
                onDeleteTeam={handleDeleteTeam}
            />

            {error && (
                <div className="edit-teams__error">
                    <p className="error-message">{error}</p>
                </div>
            )}
            <section className="edit-league__buttons">
                <div className="btn-add-team">
                    <Button onClick={handleAddTeam} type="no-bg">
                        Add team
                    </Button>
                </div>
                <div className="edit-league__changes">
                    <div className="btn-save-league">
                        <Button
                            disabled={isLoading || disableSave}
                            onClick={handleConfirmChanges}
                            type="save"
                        >
                            {isLoading ? 'Loading...' : 'Save'}
                        </Button>
                    </div>
                    <div className="btn-cancel-edit-league">
                        <Button onClick={handleCancelChanges} type="cancel">
                            Cancel
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default EditLeagueFields;
