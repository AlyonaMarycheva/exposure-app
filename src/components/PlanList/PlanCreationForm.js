import React, {useState, useEffect} from 'react';
import { useExpService } from '../../context/expService.js';
import { 
  makeStyles, 
  Box,
  FormGroup,
  Dialog,
  Button,
  DialogActions,
  DialogTitle,
  DialogContent
 } 
from '@material-ui/core';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import locale from "date-fns/locale/ru";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import FormMenu from "../../reusable/FormMenu";
import role from '../../utils/role.js';

const useStyles = makeStyles({
  modal: {
    minWidth: 400
  },
  header: {
    paddingBottom: 0
  },
  button: {
    marginTop: 15
  },
  dateInput: {
    marginTop: 0
  }
});

const PlanCreationForm = ( 
{
  onCreation, 
  toggleCreationMode, 
  plans, 
  setPlans, 
  pageCount, 
  setPageCount, 
  currentPage, 
  limit
} 
) => {
  const classes = useStyles();
  let month = new Date().getMonth();
  const exposureService = useExpService();
  
  const [employeeId, setEmployeeId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [employeeList, setEmployeeList] = useState([]);
  const [supervisorList, setSupervisorList] = useState([]);
  const [positionList, setPositionList] = useState([]);
  const [adaptationStart, setAdaptationStart] = useState(new Date());
  const [adaptationEnd, setAdaptationEnd] = useState(new Date().setMonth(month + 3));

  const handleChangeEmployeeName = event => setEmployeeId(event.target.value);
  const handleChangePosition = event => setPositionId(event.target.value);
  const handleChangeSupervisorName = event => setSupervisorId(event.target.value);
  const handleAdaptationStart = date => setAdaptationStart(date);
  const handleAdaptationEnd = date => setAdaptationEnd(date);

  useEffect(() => {
    exposureService
      .getAll('users', { role: role.employee })
      .then(employees => { setEmployeeList(employees) })    
  }, [exposureService]);

  useEffect(() => {
    exposureService
      .getAll('users', { role: role.supervisor })
      .then(supervisors => setSupervisorList(supervisors))
  }, [exposureService]);

  useEffect(() => {
    exposureService
      .getAll('positions')
      .then(positions => setPositionList(positions)); 
  }, [exposureService]);

  const addPlan = (event) => {
    event.preventDefault()
    const planObject = 
    {
      employeePosition: positionId,
      employee: employeeId,
      supervisor: supervisorId,
      hr: "5e680f360f94107d10acba1d",
      stage: "rated",
      adaptationStart: adaptationStart,
      adaptationEnd: adaptationEnd,
      completed: "false",
      rate: "A",
      tasks: []
    };

    exposureService
      .create('plan', planObject)
      .then(createdPlan => {
        if (currentPage === pageCount) {
          if (plans.length === limit)
            setPageCount(pageCount + 1);
          else 
            setPlans(plans.concat(createdPlan));            
        };
        setEmployeeId('');
        setSupervisorId('');
        setPositionId('');
        setAdaptationStart(new Date());
        setAdaptationEnd(new Date());
      })
      .catch(error => toggleCreationMode());
  }

  return (
    <Dialog open={onCreation} onClose={toggleCreationMode} >      
      <Box className={classes.modal}  p="1rem" >
        <DialogTitle className={classes.header}>Создание плана адаптации</DialogTitle>
        <form onSubmit={addPlan}>
            <DialogContent>       
              <FormGroup >
                <FormMenu 
                  label='ФИО сотрудника' 
                  value={employeeId} 
                  handleChange={handleChangeEmployeeName} 
                  selectList={employeeList}
                />
                <FormMenu 
                  label='Должность' 
                  value={positionId} 
                  handleChange={handleChangePosition} 
                  selectList={positionList}
                />
                <FormMenu 
                  label='ФИО руководителя' 
                  value={supervisorId} 
                  handleChange={handleChangeSupervisorName} 
                  selectList={supervisorList}
                />           
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={locale}>
                  <KeyboardDatePicker    
                    className={classes.dateInput}           
                    disableToolbar        
                    variant="inline"
                    format="dd.MM.yyyy"
                    margin="normal"
                    label="Начало адаптации"
                    autoOk={true}
                    value={adaptationStart}
                    onChange={handleAdaptationStart}               
                  />
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="dd.MM.yyyy"
                    margin="normal"
                    label="Конец адаптации"
                    autoOk={true}
                    value={adaptationEnd}
                    onChange={handleAdaptationEnd}
                  />
                </MuiPickersUtilsProvider>
              </FormGroup>
            </DialogContent>
            <DialogActions>
              <Button 
                variant="contained" 
                onClick={toggleCreationMode} 
                className={classes.button}
                color="primary"
                type="Submit">
                Создать
              </Button>
            </DialogActions>
          </form>
      </Box>
    </Dialog>
  )
};

export default PlanCreationForm;