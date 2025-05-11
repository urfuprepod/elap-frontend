import { http, HttpResponse } from "msw";
import { config } from "shared/config";

import UserInfoData from './data/userInfoData.json';
import AllVideosInfoData from './data/allVideosInfoData.json';
import AllAdvertisementsData from './data/allAdvertisementsData.json';
import LastAdvertisementsData from './data/lastAdvertisementsData.json';
import LearnSectionCardsData from './data/learnSectionCardsData.json';
import LearnSubsectionCardsData from './data/learnSubsectionCardsData.json';
import LearnSubsectionContentData from './data/learnSubsectionContentData.json';

export const handlers = [
  http.get(config.baseApiUrl + config.endPoints.getUserInfoUrl, () => {
    return HttpResponse.json(UserInfoData);
  }),
  http.get(config.baseApiUrl + config.endPoints.getAllVideosInfoUrl, () => {
    return HttpResponse.json(AllVideosInfoData);
  }),
  http.get(config.baseApiUrl + config.endPoints.getAllAdvertisementsUrl, () => {
    return HttpResponse.json(AllAdvertisementsData);
  }),
  http.get(config.baseApiUrl + config.endPoints.getLastAdvertisementsUrl, () => {
    return HttpResponse.json(LastAdvertisementsData);
  }),
  http.get(config.baseApiUrl + config.endPoints.getLearnSectionCardsUrl, () => {
    return HttpResponse.json(LearnSectionCardsData);
  }),
  http.get(config.baseApiUrl + config.endPoints.getLearnSubsectionCardsUrl
      .replace('{sectionId}', ':sectionId'), () => {
    return HttpResponse.json(LearnSubsectionCardsData);
  }),
  http.get(config.baseApiUrl + config.endPoints.getLearnSubsectionContentUrl
      .replace('{sectionId}', ':sectionId')
      .replace('{subsectionId}', ':subsectionId'), () => {
    return HttpResponse.json(LearnSubsectionContentData);
  }),
  http.post(config.baseApiUrl + config.endPoints.registerUser, () => {
    return new HttpResponse(null, { status: 201 })
  }),
  http.post(config.baseApiUrl + config.endPoints.addMessage, () => {
    return new HttpResponse(null, { status: 200 })
  }),
];
