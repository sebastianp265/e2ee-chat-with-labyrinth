package edu.pw.chat.controllers.labyrinth;

import edu.pw.chat.dtos.labyrinth.EpochCreateDTO;
import edu.pw.chat.dtos.labyrinth.EpochGetDTO;
import edu.pw.chat.dtos.labyrinth.KeyBundleDTO;
import edu.pw.chat.services.MailboxMetastoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/labyrinth")
@RequiredArgsConstructor
@Slf4j
public class MailboxMetastoreController {

    private final MailboxMetastoreService mailboxMetastoreService;

    @PostMapping("/epoch")
    public Long createEpoch(Principal principal,
                            @RequestBody EpochCreateDTO epochCreateDTO) {
        String username = principal.getName();
        log.debug("Creating epoch: user = {}, keyBundle = {}", username, epochCreateDTO);
        return mailboxMetastoreService.createEpoch(username, epochCreateDTO);
    }

    @PostMapping("/epoch/{epochId}")
    public String joinEpoch(Principal principal,
                            @PathVariable Long epochId,
                            @RequestBody KeyBundleDTO keyBundleDTO) {
        String username = principal.getName();
        log.debug("Joining epoch: user = {}, epoch = {}, keyBundle = {}", username, epochId, keyBundleDTO);
        return mailboxMetastoreService.joinEpoch(username, epochId, keyBundleDTO);
    }

    @GetMapping("/epoch/{epochId}")
    public EpochGetDTO getEpoch(Principal principal, @PathVariable Long epochId) {
        String username = principal.getName();
        log.debug("Getting epoch info: user = {}, epoch = {}", username, epochId);
        return mailboxMetastoreService.getEpoch(username, epochId);
    }
}
