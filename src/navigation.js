import React, { createContext, useEffect, useState } from 'react';
import Navigo from 'navigo';

export const router = new Navigo(null, true, '#');
export const NavigationContext = createContext({});
export const navigate = route => router.navigate(route);
