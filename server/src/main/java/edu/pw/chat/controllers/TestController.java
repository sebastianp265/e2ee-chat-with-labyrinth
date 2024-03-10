package edu.pw.chat.controllers;

import edu.pw.chat.entitities.UserInfo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/hello")
    public UserInfo hello() {
        return new UserInfo();
    }
}
