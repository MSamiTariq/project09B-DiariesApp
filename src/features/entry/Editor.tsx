import React, { FC, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../rootReducer';
import Markdown from 'markdown-to-jsx';
import http from '../../services/api';
import { Entry } from '../../interfaces/entry.interface';
import { Diary } from '../../interfaces/diary.interface';
import { setCurrentlyEditing, setCanEdit } from './editorSlice';
import { updateDiary } from '../diary/diariesSlice';
import { updateEntry } from './entriesSlice';
import { showAlert } from '../../util';
import { useAppDispatch } from '../../store';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'; 
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: '5px',
        height: '20px',
        width: '10px',
      },
    },
  }),
);


const Editor: FC = () => {
    const { currentlyEditing: entry, canEdit, activeDiaryId } = useSelector((state: RootState) => state.editor);

    const [editedEntry, updateEditedEntry] = useState(entry);

    const dispatch = useAppDispatch();

    const classes = useStyles();

    const saveEntry = async () => {
        if (activeDiaryId == null) {
            return showAlert('Please select a diary.', 'warning');
        }
        if (entry == null) {
            http
                .post<Entry, { diary: Diary; entry: Entry }>(
                    `/diaries/entry/${activeDiaryId}`,
                    editedEntry
                )
                .then((data) => {
                    if (data != null) {
                        const { diary, entry: _entry } = data;
                        dispatch(setCurrentlyEditing(_entry));
                        dispatch(updateDiary(diary));
                    }
                });
        } else {
            http
                .put<Entry, Entry>(`diaries/entry/${entry.id}`, editedEntry)
                .then((_entry) => {
                    if (_entry != null) {
                        dispatch(setCurrentlyEditing(_entry));
                        dispatch(updateEntry(_entry));
                    }
                });
        }
        dispatch(setCanEdit(false));
    }

    useEffect(() => {
        updateEditedEntry(entry);
    }, [entry]);

    return (
        <div className="editor">
            <header
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: '0.2em',
                    paddingBottom: '0.2em',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                }}
            >
                {entry && !canEdit ? (
                    <h4>
                        {entry.title}
                        <Button color="primary"
                        className={classes.root}
                        onClick={(e) => {
                                e.preventDefault();
                                if (entry != null) {
                                    dispatch(setCanEdit(true));
                                }
                            }}
                        >Edit</Button>
                    </h4>
                ) : (
                        <TextField
                            label = "Title"
                            variant = "outlined"
                            fullWidth
                            value={editedEntry?.title ?? ''}
                            disabled={!canEdit}
                            onChange={(e) => {
                                if (editedEntry) {
                                    updateEditedEntry({
                                        ...editedEntry,
                                        title: e.target.value,
                                    });
                                } else {
                                    updateEditedEntry({
                                        title: e.target.value,
                                        content: '',
                                    });
                                }
                            }}
                        />
                    )}
            </header>
            {entry && !canEdit ? (
                <Markdown>{entry.content}</Markdown>
            ) : (
                    <>
                        <TextField
                            disabled={!canEdit}
                            variant = "outlined"
                            label= "Content"
                            multiline
                            rows = {2}
                            fullWidth
                            placeholder="Supports markdown!"
                            value={editedEntry?.content ?? ''}
                            onChange={(e) => {
                                if (editedEntry) {
                                    updateEditedEntry({
                                        ...editedEntry,
                                        content: e.target.value,
                                    });
                                } else {
                                    updateEditedEntry({
                                        title: '',
                                        content: e.target.value,
                                    });
                                }
                            }}
                        />
                        <button onClick={saveEntry} disabled={!canEdit}>
                            Save
              </button>
                    </>
                )}
        </div>
    );
};

export default Editor;