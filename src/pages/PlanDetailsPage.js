import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, makeStyles, Box } from '@material-ui/core';

import AdaptationPlanCard from '../components/PlanDetails/AdaptationPlanCard.js';
import TasksBlock from '../components/TaskBlock/TasksBlock.js';
import CommentBlock from '../components/CommentBlock/CommentBlock.js';
import SendButton from '../components/PlanDetails/SendButton.js';
import { useExpService } from '../context/expService.js';
import { useAuth } from '../context/auth.js';
import role from '../utils/role.js';
import Confirmation from '../reusable/Confirmation.js';

const useStyles = makeStyles(theme => ({
  sendButtonsBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  }
}));

const PlanDetailsPage = () => {
  const expService = useExpService();
  const [ planId ] = useState(useParams().id);
  const [ plan, setPlan ] = useState(null);
  const user = useAuth();
  const classes = useStyles();
  const [isNextStage, setIsNextStage] = useState(false);
  const [isPreviousStage, setIsPreviousStage] = useState(false);

  const handleSwitchForward = () => setIsNextStage(true);
  const handleSwitchBack = () => setIsPreviousStage(true);

  useEffect(() => {
    expService
      .get('plan', planId)
      .then(plan => setPlan(plan));
  }, [expService, planId]);

  const getSendButtonText = (stage, direction) => {
    const maps = {
      0: 'На заполнение',
      1: 'На согласование',
      2: 'На выполнение',
      3: 'На оценку',
      4: 'Завершить оценку'
    };

    const buttonText = (direction === 'backward')
      ? (`${maps[stage - 1]}`)
      : (`${maps[stage + 1]}`);

    return buttonText;
  };

  const handleForwardClick = async () => {
    const newPlan = {
      ...plan,
      employeePosition: plan.employeePosition.id,
      hr: plan.hr.id,
      employee: plan.employee.id,
      supervisor: plan.supervisor.id,
      stage: ++plan.stage
    };
    const updatedPlan =  await expService.update('plan', planId, newPlan);
    setPlan(updatedPlan);
  };
  
  const handleBackwardClick = async () => {
    const newPlan = {
      ...plan,
      employeePosition: plan.employeePosition.id,
      hr: plan.hr.id,
      employee: plan.employee.id,
      supervisor: plan.supervisor.id,
      stage: --plan.stage
    };
    const updatedPlan =  await expService.update('plan', planId, newPlan);
    setPlan(updatedPlan);
  };

  const allowedToForward = () => {
    const permissions = {
      [role.employee]: [1, 0, 1, 0, 0],
      [role.supervisor]: [0, 1, 1, 1, 0],
      [role.hr]: [1, 1, 1, 1, 0],
    };
    return Boolean(permissions[user.role][plan.stage])
  };

  const allowedToBackward= () => {
    const permissions = {
      [role.employee]: [0, 0, 0, 0, 0],
      [role.supervisor]: [0, 1, 0, 1, 0],
      [role.hr]: [0, 1, 1, 1, 1],
    };
    return Boolean(permissions[user.role][plan.stage])
  };

  if (!plan) {
    return null
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <AdaptationPlanCard
            displayPlan={plan}
            setDisplayPlan={setPlan} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TasksBlock planObj={plan} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CommentBlock planId={planId} />
        </Grid>
      </Grid>
      <Box className={classes.sendButtonsBox}>
        { allowedToBackward()
          ? <SendButton
              type='backward'
              // handler={handleBackwardClick}
              handler={handleSwitchBack}
              text={getSendButtonText(plan.stage, 'backward')} />
          : null}
        { allowedToForward()
          ? <SendButton
              type='forward'
              // handler={handleForwardClick}
              handler={handleSwitchForward}
              text={getSendButtonText(plan.stage, 'forward')} />
          : null}
      </Box>
      <Confirmation 
        isOpen={isNextStage}
        setIsOpen={setIsNextStage}
        message='Вы уверены, что хотите перейти на следующий этап?'
        action={handleForwardClick}
        buttonText='да'
      />
      <Confirmation 
        isOpen={isPreviousStage}
        setIsOpen={setIsPreviousStage}
        message='Вы уверены, что хотите вернуться на предыдущий этап?'
        action={handleBackwardClick}
        buttonText='да'
      />
    </>
  );
};

export default PlanDetailsPage;