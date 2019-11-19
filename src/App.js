import React, { useState } from "react";
import pagarme from "pagarme";
import CryptoJS from "crypto-js";
import { Container, Button } from "reactstrap";

const ENCRYPTION_KEY = "ek_test_kxGmez3WW5AnHPV4s1Zo1R0w4yqu0t";
const API_KEY = "ak_test_y6LbzJZugmEzFLmaViF6rGwvPAzwDD";

function App() {
  const [idTransaction, setIdTransaction] = useState("");

  function handleCaptureTransaction(token) {
    pagarme.client
      .connect({ api_key: API_KEY })
      .then(client =>
        client.transactions.capture({ id: token, amount: 12700 }).then(data => {
          console.log(data);
          switch (data.status) {
            case "paid":
              //handleSubscription(data.payment_method, data.customer);
              break;

            case "waiting_payment":
              if (data.payment_method === "boleto") {
                console.log(data.boleto_url);
              }
              break;

            default:
              break;
          }
        })
      )
      .error(error => console.log(error));
  }

  function handleSubscription(customer, payment_method, card_hash) {
    pagarme.client.connect({ api_key: API_KEY }).then(client =>
      client.subscriptions
        .create({
          plan_id: 435831,
          postback_url: "https://enuikc9fwb6w7.x.pipedream.net",
          payment_method: payment_method,
          card_hash: card_hash,
          customer: customer
        })
        .then(data => {
          if (
            data.payment_method === "boleto" &&
            data.current_transaction.status === "waiting_payment"
          )
            setIdTransaction(data.current_transaction.id);
          console.log(data);
        })
    );
  }

  const handlePaidBoleto = () => {
    pagarme.client.connect({ api_key: API_KEY }).then(client => {
      client.transactions.find({ id: idTransaction }).then(transaction => {
        client.transactions
          .update({
            id: transaction.id,
            status: "paid"
          })
          .then(setIdTransaction(""));
      });
    });
  };

  const handleCheckPostback = () => {
    const postbackBody = {
      id: "439909",
      fingerprint: "4d0b386007dd004225ed57108438079084a71328",
      event: "subscription_status_changed",
      old_status: "unpaid",
      desired_status: "paid",
      current_status: "paid",
      object: "subscription",
      subscription: {
        object: "subscription",
        plan: {
          object: "plan",
          id: "435831",
          amount: "12700",
          days: "30",
          name: "NuData Light 1000",
          trial_days: "0",
          date_created: "2019-09-25T14:31:34.794Z",
          payment_methods: ["boleto", "credit_card"],
          color: "",
          charges: "",
          installments: "1",
          invoice_reminder: "",
          payment_deadline_charges_interval: "1"
        },
        id: "439909",
        current_transaction: {
          object: "transaction",
          status: "waiting_payment",
          refuse_reason: "",
          status_reason: "acquirer",
          acquirer_response_code: "",
          acquirer_name: "pagarme",
          acquirer_id: "5d850cb6c1155728a4e69b0f",
          authorization_code: "",
          soft_descriptor: "",
          tid: "7017629",
          nsu: "7017629",
          date_created: "2019-09-26T00:03:04.756Z",
          date_updated: "2019-09-26T00:03:05.154Z",
          amount: "12700",
          authorized_amount: "12700",
          paid_amount: "0",
          refunded_amount: "0",
          installments: "1",
          id: "7017629",
          cost: "0",
          card_holder_name: "",
          card_last_digits: "",
          card_first_digits: "",
          card_brand: "",
          card_pin_mode: "",
          card_magstripe_fallback: "false",
          postback_url: "",
          payment_method: "boleto",
          capture_method: "ecommerce",
          antifraud_score: "",
          boleto_url: "https://pagar.me",
          boleto_barcode: "1234 5678",
          boleto_expiration_date: "2019-10-26T00:03:04.747Z",
          referer: "",
          ip: "",
          subscription_id: "439909",
          reference_key: "",
          device: "",
          local_transaction_id: "",
          local_time: "",
          fraud_covered: "false",
          order_id: "",
          risk_level: "unknown",
          receipt_url: "",
          payment: "",
          addition: "",
          discount: ""
        },
        postback_url: "https://enuikc9fwb6w7.x.pipedream.net",
        payment_method: "boleto",
        card_brand: "",
        card_last_digits: "",
        current_period_start: "2019-09-26T00:03:04.744Z",
        current_period_end: "2019-10-26T00:03:04.747Z",
        charges: "1",
        soft_descriptor: "",
        status: "paid",
        date_created: "2019-09-26T00:02:57.825Z",
        date_updated: "2019-09-26T00:03:05.213Z",
        phone: {
          object: "phone",
          ddi: "55",
          ddd: "41",
          number: "988540622",
          id: "483420"
        },
        address: {
          object: "address",
          street: "Rua Napoleão Bonaparte",
          complementary: "",
          street_number: "1339",
          neighborhood: "Bairro Alto",
          city: "Curitiba",
          state: "PR",
          zipcode: "82820270",
          country: "Brasil",
          id: "2420598"
        },
        customer: {
          object: "customer",
          id: "2327531",
          external_id: "",
          type: "",
          country: "",
          document_number: "03407005997",
          document_type: "cpf",
          name: "Renato Scarante",
          email: "renato.scarante@nujob.com.br",
          phone_numbers: "",
          born_at: "",
          birthday: "",
          gender: "",
          date_created: "2019-09-26T00:02:57.347Z"
        },
        card: "",
        metadata: "",
        settled_charges: "",
        manage_url:
          "https://pagar.me/customers/#/subscriptions/439909?token=test_subscription_8zRziY7Q7GiSUdx9UKBR8O2PRTgn5W"
      }
    };

    const postbackBodyJsonStringify = JSON.stringify(postbackBody);

    console.log("fingerprint", postbackBody.fingerprint);

    var hashBody = CryptoJS.HmacSHA1(postbackBody, API_KEY).toString();
    console.log("hashBody", hashBody);

    var hashBodyJsonStringify = CryptoJS.HmacSHA1(
      postbackBodyJsonStringify,
      API_KEY
    ).toString(CryptoJS.enc.Utf8);
    console.log("hashBodyJsonStringify", hashBodyJsonStringify);

    var hash = pagarme.postback.calculateSignature(
      "2eb560902cf7cca96fd34f5ff79632136055f339",
      postbackBody
    );
    console.log("hash", hash);

    var hashJsonStringify = pagarme.postback.calculateSignature(
      "2eb560902cf7cca96fd34f5ff79632136055f339",
      hashBodyJsonStringify
    );
    console.log("hashJsonStringify", hashJsonStringify);

    var ok = pagarme.postback.verifySignature(
      "2eb560902cf7cca96fd34f5ff79632136055f339",
      postbackBody,
      postbackBody.fingerprint
    );
    console.log("ok", ok);

    var okJsonStringify = pagarme.postback.verifySignature(
      "2eb560902cf7cca96fd34f5ff79632136055f339",
      hashBodyJsonStringify,
      postbackBody.fingerprint
    );
    console.log("okJsonStringify", okJsonStringify);
  };

  const handleOpenCheckout = () => {
    //inicia a instância do checkout
    var checkout = new window["PagarMeCheckout"].Checkout({
      encryption_key: ENCRYPTION_KEY,
      success: function(data) {
        console.log(data);

        if (data.token) {
          handleCaptureTransaction(data.token);
        } else {
          //handleSubscription(
          //  data.customer,
          //  data.payment_method,
          //  data.card_hash ? data.card_hash : ""
          //);
        }
      },
      error: function(err) {
        console.log(err);
      },
      close: function() {
        console.log("The modal has been closed.");
      }
    });

    checkout.open({
      amount: 12700,
      paymentButtonText: "Upgrade",
      buttonText: "Upgrade",
      buttonClass: "botao-pagamento",
      createToken: "false",
      paymentMethods: "credit_card, boleto",
      customerData: "true",
      reviewInformations: "true",
      items: [],
      billing: {},
      shipping: {}
    });
  };

  return (
    <div className="App">
      <header className="App-header"></header>
      <div>
        <Container fluid>
          <Button id="pay-button" size="lg" onClick={handleOpenCheckout}>
            PAGAR.ME
          </Button>

          <Button
            id="pay-button"
            size="lg"
            onClick={handlePaidBoleto}
            disabled={idTransaction === ""}
          >
            PAGAR BOLETO
          </Button>

          <Button id="pay-button" size="lg" onClick={handleCheckPostback}>
            VALIDAR POSTBACK
          </Button>
        </Container>
      </div>
    </div>
  );
}

export default App;
