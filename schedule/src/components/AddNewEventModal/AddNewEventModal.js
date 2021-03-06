import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Select,
  Input,
  DatePicker,
  Modal,
  Button,
  Checkbox,
} from "antd";
import "antd/dist/antd.css";
import "./ModalWindow.scss";
import {
  MENTOR_MODAL,
  TASKS_TYPES,
  TIME_ZONES,
  userModal,
} from "./../../constants/constants";
import { useDispatch, useSelector } from "react-redux";
import { actionCreator } from "../../store/actions";
import {
  YMaps,
  Map,
  Placemark,
  GeolocationControl,
  FullscreenControl,
  ZoomControl,
} from "react-yandex-maps";
import { map } from "../../constants/constants";
import createMap from "../map/map";
import Form, { useForm } from "antd/lib/form/Form";
import FormItem from "antd/lib/form/FormItem";

function getTasks(TASKS_TYPES) {
  return TASKS_TYPES.map((el) => {
    return (
      <Option value={el} key={el}>
        {el}
      </Option>
    );
  });
}

function getTimeZonesValues(TIME_ZONES) {
  return TIME_ZONES.map((el) => {
    return (
      <Option value={el.value} key={el.name}>
        {el.name}({el.value})
      </Option>
    );
  });
}
function dateFormatReadable(year, month, day, hours, minutes) {
  const m = month + 1 < 10 ? `0${month + 1}` : month + 1;
  const d = day < 10 ? `0${day}` : day;
  const t = hours + ":" + (minutes < 10 ? `0${minutes}` : minutes);
  return `${year}-${m}-${d} ${t}`;
}
const { Option, OptGroup } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AddNewEventModal = () => {
  const timeZone = useSelector((state) => state.optionsReducer.timeZone);
  const { DATE_FORMAT } = userModal;
  const dispatch = useDispatch();
  const [isOfflineEvent, setIsOfflineEvent] = useState(false);
  const [isEventWithDeadline, setisEventWithDeadline] = useState(true);
  const [render, setRender] = useState(false);
  const visible = useSelector(
    (state) => state.modalWindowReducer.AddNewEventModalVisability
  );
  const isImpairedVersion = useSelector(
    (state) => state.optionsReducer.impairedVersion
  );
  const [form] = useForm();
  useEffect(() => {
    setRender(visible);
    form.resetFields();
    setIsOfflineEvent(false);
    form.setFieldsValue({ timeZone: formatTimeZoneKeys(timeZone) });
  }, [visible, render, timeZone, form]);
  const [mapCoord, setmapCoord] = useState([53.868833, 27.596686]);
  const onEventLocationChange = (e) => {
    if (e === "online") {
      setIsOfflineEvent(false);
    } else {
      setIsOfflineEvent(true);
    }
  };
  const formatTimeZoneInitial = (timeName) => {
    return `${timeName}`.length > 3
      ? TIME_ZONES[TIME_ZONES.findIndex((x) => x.name === timeName)]?.value
      : timeName;
  };
  const formatTimeZoneKeys = (timeName) => {
    return TIME_ZONES[TIME_ZONES.findIndex((x) => x.name === timeName)].name;
  };
  const onEventDeadlineChange = (e) => {
    form.setFieldsValue({ currentDate: null });
    setisEventWithDeadline(e.target.checked);
  };
  const onFinish = async (values) => {
    const resEvent = {
      id: "000",
      name: values.name,
      description: values.description,
      descriptionUrl: values.descriptionUrl,
      type: values.type,
      timeZone: formatTimeZoneInitial(form.getFieldValue("timeZone")),
      dateTime: Array.isArray(values.currentDate)
        ? dateFormatReadable(
            values.currentDate[0].year(),
            values.currentDate[0].month(),
            values.currentDate[0].date(),
            values.currentDate[0].hours(),
            values.currentDate[0].minutes()
          )
        : dateFormatReadable(
            values.currentDate.year(),
            values.currentDate.month(),
            values.currentDate.date(),
            values.currentDate.hours(),
            values.currentDate.minutes()
          ),
      place: !isOfflineEvent
        ? ""
        : JSON.stringify({
            town: values.town,
            typeStreet: "улица",
            streetName: values.streetName,
            buildingNbr: values.buildingNbr,
            additionalAddressInfo: values?.additionalAddressInfo,
          }),
      comment: "",
      organizer: "kate-latushkina",
      deadlineDateTime: Array.isArray(values.currentDate)
        ? dateFormatReadable(
            values.currentDate[1].year(),
            values.currentDate[1].month(),
            values.currentDate[1].date(),
            values.currentDate[1].hours(),
            values.currentDate[1].minutes()
          )
        : "",
    };
    if (isOfflineEvent) {
      const coordObj = await createMap(
        values.town,
        values.typeStreet,
        values.streetName,
        values.buildingNbr
      );
      setmapCoord([+coordObj.latitude, +coordObj.longitude]);
    }
    dispatch(actionCreator.addEvent(resEvent));
    dispatch(actionCreator.AddNewEventModalVisability(!visible));
  };
  const updateMap = async () => {
    if (
      form.getFieldValue("town") &&
      form.getFieldValue("streetName") &&
      form.getFieldValue("buildingNbr")
    ) {
      const coordObj = await createMap(
        form.getFieldValue("town"),
        "улица",
        form.getFieldValue("streetName"),
        form.getFieldValue("buildingNbr")
      );
      setmapCoord([+coordObj.latitude, +coordObj.longitude]);
    }
  };
  const handleCancel = () => {
    dispatch(actionCreator.AddNewEventModalVisability(!visible));
  };

  return (
    <Modal
      className={
        isImpairedVersion
          ? "impairedVersion modal-addNewEvent"
          : "modal-addNewEvent"
      }
      visible={visible}
      footer={null}
      onCancel={handleCancel}
      forceRender
    >
      <h2 className="wrapper-modal-add__header">Add new event</h2>
      <Form
        className="form-modal-addNewEvent"
        form={form}
        onFinish={onFinish}
        name="basic"
      >
        <Row gutter={16}>
          <Col
            span={12}
            style={{ marginLeft: "2rem" }}
            className="modal-addNewEvent-col"
          >
            <FormItem
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please input Task Name!",
                },
              ]}
            >
              <Input
                placeholder="Task Name"
                style={{ maxWidth: 200, minWidth: 110 }}
              />
            </FormItem>
          </Col>
          <Col
            span={8}
            style={{ marginLeft: "2rem" }}
            className="modal-addNewEvent-col"
          >
            <FormItem
              name="type"
              rules={[
                {
                  required: true,
                  message: "Please select Task type!",
                },
              ]}
            >
              <Select style={{ maxWidth: 200, minWidth: 110 }}>
                <OptGroup label="TaskTitle">{getTasks(TASKS_TYPES)}</OptGroup>
              </Select>
            </FormItem>
          </Col>
        </Row>

        <Col
          span={22}
          style={{ marginLeft: "2rem" }}
          className="modal-addNewEvent-col"
        >
          <FormItem name="description">
            <TextArea rows={5} placeholder="Task Description" />
          </FormItem>
        </Col>

        <Row>
          <Col
            span={14}
            style={{ marginLeft: "2rem" }}
            className="modal-addNewEvent-col"
          >
            <FormItem
              name="timeZone"
              initialValue={formatTimeZoneInitial(timeZone)}
            >
              <Select style={{ maxWidth: 200, minWidth: 110 }}>
                <OptGroup label="Timezones">
                  {getTimeZonesValues(TIME_ZONES)}
                </OptGroup>
              </Select>
            </FormItem>
          </Col>
          <Col
            span={6}
            style={{ marginLeft: "2rem" }}
            className="modal-addNewEvent-col"
          >
            <Checkbox onChange={onEventDeadlineChange} defaultChecked>
              Task with deadline?
            </Checkbox>
          </Col>
          <Col span={16} className="modal-addNewEvent-col">
            <FormItem
              name="currentDate"
              rules={[
                {
                  required: true,
                  message: "Please input Task Date!",
                },
              ]}
            >
              {isEventWithDeadline ? (
                <RangePicker
                  style={{ marginLeft: "2rem" }}
                  showTime={{
                    hideDisabledOptions: true,
                  }}
                  format={DATE_FORMAT}
                />
              ) : (
                <DatePicker
                  style={{ marginLeft: "2rem" }}
                  showTime={{
                    hideDisabledOptions: true,
                  }}
                  format={DATE_FORMAT}
                />
              )}
            </FormItem>
          </Col>
        </Row>

        <Col
          span={22}
          style={{ marginLeft: "2rem" }}
          className="modal-addNewEvent-col"
        >
          <FormItem name="descriptionUrl">
            <Input placeholder="Additional url" />
          </FormItem>
        </Col>

        <Col
          span={22}
          style={{ marginLeft: "2rem" }}
          className="modal-addNewEvent-col"
        >
          <FormItem name="place" initialValue={"online"}>
            <Select
              style={{ maxWidth: 200, minWidth: 110 }}
              onChange={onEventLocationChange}
            >
              <OptGroup label="Place">
                <Option value="online">{MENTOR_MODAL.isOnline.online}</Option>
                <Option value="offline">{MENTOR_MODAL.isOnline.offline}</Option>
              </OptGroup>
            </Select>
          </FormItem>

          {isOfflineEvent && (
            <Row span={22}>
              <Col span={12} className="modal-addNewEvent-col">
                <FormItem name="town">
                  <Input
                    placeholder="Town"
                    style={{ marginBottom: "5px" }}
                    onChange={updateMap}
                  />
                </FormItem>
                <FormItem name="streetName" onChange={updateMap}>
                  <Input placeholder="Street" style={{ marginBottom: "5px" }} />
                </FormItem>
                <FormItem name="buildingNbr">
                  <Input placeholder="№ of house" onChange={updateMap} />
                </FormItem>
                <FormItem name="additionalAddressInfo">
                  <Input placeholder="additional Address Info" />
                </FormItem>
              </Col>
              <Col className="container-map">
                <YMaps query={{ apikey: map.KEY }}>
                  <Map
                    defaultState={{
                      center: mapCoord,
                      zoom: 9,
                    }}
                    state={{
                      center: mapCoord,
                      zoom: 9,
                    }}
                    width="100%"
                    height="100%"
                  >
                    <Placemark
                      geometry={mapCoord}
                      options={{
                        draggable: true,
                        fillColor: "#DB709377",
                        strokeColor: "#990066",
                        strokeOpacity: 0.8,
                        strokeWidth: 5,
                      }}
                    />
                    <GeolocationControl options={{ float: "left" }} />
                    <FullscreenControl />
                    <ZoomControl options={{ float: "right" }} />
                  </Map>
                </YMaps>
              </Col>
            </Row>
          )}
        </Col>
        <FormItem className="ant-modal-footer modal-addNewEvent-footer">
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default AddNewEventModal;
