import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { actionCreator } from '../../store/actions';
import TableForSchedule from '../table/table';
import Header from '../header/header';
import ScheduleList from '../list/ScheduleList';
import UserWindow from '../UserWindow/UserWindow';

const Container = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actionCreator.initEvents());
    dispatch(actionCreator.initOptions());
  });

  return (
    <>
      <h1>Schedule</h1>
      <Header />
      <TableForSchedule />
    </>
  )};

export default Container;