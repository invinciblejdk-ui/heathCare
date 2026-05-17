package com.healthCare.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/onboarding")
public class HelloController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello from the Onboarding Service!";
    }
}
