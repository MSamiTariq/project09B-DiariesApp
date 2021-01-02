import React, { FC, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../rootReducer';
import http from '../../services/api';
import { Entry } from '../../interfaces/entry.interface';
import { setEntries } from '../entry/entriesSlice';
import { setCurrentlyEditing, setCanEdit } from '../entry/editorSlice';
import dayjs from 'dayjs';
import { useAppDispatch } from '../../store';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});


const DiaryEntriesList: FC = () => {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;
  const { entries } = useSelector((state: RootState) => state);
  const dispatch = useAppDispatch();
  const {id}:any=useParams();

  useEffect(() => {
    if (id != null) {
      http
        .get<null, { entries: Entry[] }>(`/diaries/entries/${id}`)
        .then(({ entries: _entries }) => {
          if (_entries) {
            const sortByLastUpdated = _entries.sort((a, b) => {
              return dayjs(b.updatedAt).unix() - dayjs(a.updatedAt).unix();
            });
            dispatch(setEntries(sortByLastUpdated));
          }
        });
    }
  }, [id, dispatch]);

  return (
    <div className="entries">
      <header>
        <Link to="/">
          <h3>← Go Back</h3>
        </Link>
      </header>
      {entries.map((entry) => {
        console.log(entry);
        return(
         <Card key = {entry.id} className={classes.root} variant="outlined">
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          Created At: {entry.createdAt}
        </Typography>
        <Typography variant="h5" component="h2">
          {entry.title}
        </Typography>
        <Typography variant="body2" component="p">
          {entry.content}
          <br /> <br />
          Updated At: {entry.updatedAt}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small"
        onClick={() => {
              dispatch(setCurrentlyEditing(entry));
              dispatch(setCanEdit(true));
            }}
        >Edit</Button>
      </CardActions>
    </Card>)
      })}
    </div>
  );
};

export default DiaryEntriesList;
